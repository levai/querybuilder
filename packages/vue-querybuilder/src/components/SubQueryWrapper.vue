<script setup lang="ts">
// @ts-nocheck - sub context schema/actions typing
import { ref, watch, computed, inject, provide, toRaw } from 'vue';
import {
  add,
  remove,
  update,
  move,
  isRuleGroup,
  prepareRuleGroup,
  prepareOptionList,
  generateID,
  getFirstOption,
  getOption,
  filterFieldsByComparator,
} from '@react-querybuilder/core';
import type { Path, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { QUERY_REF_KEY, DISPATCH_KEY, QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';

const props = defineProps<{
  modelValue: unknown;
  disabled?: boolean;
  /** 子 Query 的 fields，对齐 React 的 subproperties.fields */
  subFields?: unknown[];
}>();

const emit = defineEmits<{ 'update:modelValue': [value: RuleGroupTypeAny] }>();

const contextRef = inject(QUERY_BUILDER_CONTEXT_KEY);
const parentSchemaRef = computed(() => {
  const c = contextRef?.value as { schema?: { value?: unknown } };
  return c?.schema?.value ?? (contextRef?.value as { schema?: unknown })?.schema;
});
const schemaRef = computed(() => {
  const parent = parentSchemaRef.value as Record<string, unknown> | undefined;
  if (!parent) return parent;
  const subFields = props.subFields;
  if (subFields == null || subFields.length === 0) return parent;
  const result = prepareOptionList({
    optionList: subFields as { name: string; label: string; value?: string }[],
    autoSelectOption: (parent as { autoSelectField?: boolean })?.autoSelectField ?? true,
  }) as { optionList: unknown[]; optionsMap?: Record<string, unknown> };
  const subFieldsList = result.optionList;
  const subFieldMap = result.optionsMap ?? {};
  const getRuleDefaultOperatorSub = (parent as { getRuleDefaultOperator?: (f: string) => string })?.getRuleDefaultOperator ?? (() => '=');
  const getValueSourcesSub = (parent as { getValueSources?: (f: string, o: string) => unknown })?.getValueSources ?? (() => ['value']);
  const getValuesSub = (parent as { getValues?: (f: string, o: string, m: { fieldData: unknown }) => unknown[] })?.getValues ?? (() => []);
  const getValueEditorTypeSub = (parent as { getValueEditorType?: (f: string, o: string) => string })?.getValueEditorType ?? (() => 'text');

  const getRuleDefaultValueSub = (r: RuleType): unknown => {
    const fieldData = (subFieldMap as Record<string, unknown>)[r.field as string] ?? { name: r.field, value: r.field, label: r.field };
    const fd = fieldData as { defaultValue?: unknown };
    if (fd?.defaultValue != null) return fd.defaultValue;
    const vals = getValuesSub(r.field, r.operator, { fieldData });
    if (r.valueSource === 'field') {
      const filtered = filterFieldsByComparator(fieldData as { comparator?: string; groupNumber?: string }, subFieldsList, r.operator);
      return filtered.length > 0 ? getFirstOption(filtered) : '';
    }
    if (vals.length > 0) {
      const editorType = getValueEditorTypeSub(r.field, r.operator);
      if (editorType === 'checkbox') return false;
      const first = getFirstOption(vals as { name?: string; value?: string }[]);
      const valuePlaceholder = '~';
      return first === valuePlaceholder || first == null ? '' : first;
    }
    return '';
  };

  const createRuleSub = (): RuleType => {
    const field = (getFirstOption(subFieldsList as { name?: string; value?: string }[]) ?? '') as string;
    const operator = getRuleDefaultOperatorSub(field);
    const valueSource = (getFirstOption(getValueSourcesSub(field, operator) as { name?: string; value?: string }[]) ?? 'value') as string;
    const newRule: RuleType = { id: generateID(), field, operator, valueSource, value: '' } as RuleType;
    return { ...newRule, value: getRuleDefaultValueSub(newRule) };
  };

  const createRuleGroupSub = (): RuleGroupTypeAny => {
    const combinators = (parent as { combinators?: unknown[] })?.combinators ?? [{ name: 'and', label: 'and' }];
    return {
      id: generateID(),
      combinator: (getFirstOption(combinators as { name?: string }[]) ?? 'and') as string,
      rules: [],
      not: false,
    } as RuleGroupTypeAny;
  };

  return {
    ...parent,
    fields: subFieldsList,
    fieldMap: subFieldMap,
    getRuleDefaultValue: getRuleDefaultValueSub,
    createRule: createRuleSub,
    createRuleGroup: createRuleGroupSub,
    validationMap: (parent as { validationMap?: unknown })?.validationMap ?? {},
  };
});

const subQueryRef = ref<RuleGroupTypeAny | null>(null);

watch(
  () => props.modelValue,
  (v) => {
    if (isRuleGroup(v)) {
      subQueryRef.value = v as RuleGroupTypeAny;
    } else if (subQueryRef.value == null) {
      const schema = schemaRef.value as { createRuleGroup?: () => RuleGroupTypeAny } | undefined;
      const initial =
        schema?.createRuleGroup?.() ??
        (prepareRuleGroup(
          { combinator: 'and', rules: [], not: false } as RuleGroupTypeAny,
          { idGenerator: generateID }
        ) as RuleGroupTypeAny);
      emit('update:modelValue', initial);
      subQueryRef.value = initial;
    }
  },
  { immediate: true }
);

const subDispatch = (newGroup: RuleGroupTypeAny) => {
  subQueryRef.value = newGroup;
  emit('update:modelValue', newGroup);
};

const subActions = computed(() => {
  const schema = schemaRef.value as {
    combinators?: unknown[];
    getRuleDefaultOperator?: (field: string) => string;
    getRuleDefaultValue?: (r: RuleType) => unknown;
    getValueSources?: (field: string, op: string) => unknown;
    getMatchModes?: (field: string) => unknown[];
  } | undefined;
  const combinators = schema?.combinators ?? [];
  return {
    onRuleAdd(rule: RuleType, parentPath: Path) {
      const g = subQueryRef.value;
      if (!g) return;
      // 使用 toRaw 去掉响应式代理，core 函数内部会用 Immer 创建新对象
      const rawG = toRaw(g);
      const newGroup = add(rawG, rule, parentPath, { combinators, idGenerator: generateID });
      subDispatch(newGroup);
    },
    onGroupAdd(ruleGroup: RuleGroupTypeAny, parentPath: Path) {
      const g = subQueryRef.value;
      if (!g) return;
      const rawG = toRaw(g);
      const newGroup = add(rawG, ruleGroup, parentPath, { combinators, idGenerator: generateID });
      subDispatch(newGroup);
    },
    onGroupRemove(path: Path) {
      const g = subQueryRef.value;
      if (!g) return;
      const rawG = toRaw(g);
      subDispatch(remove(rawG, path));
    },
    onRuleRemove(path: Path) {
      const g = subQueryRef.value;
      if (!g) return;
      const rawG = toRaw(g);
      subDispatch(remove(rawG, path));
    },
    onPropChange(prop: string, value: unknown, path: Path) {
      const g = subQueryRef.value;
      if (!g) return;
      const rawG = toRaw(g);
      const newGroup = update(rawG, prop, value, path, {
        resetOnFieldChange: true,
        resetOnOperatorChange: false,
        getRuleDefaultOperator: schema?.getRuleDefaultOperator ?? (() => '='),
        getValueSources: (schema?.getValueSources as (f: string, o: string) => unknown) ?? (() => ['value']),
        getRuleDefaultValue: schema?.getRuleDefaultValue ?? (() => ''),
        getMatchModes: (schema?.getMatchModes as (f: string) => unknown[]) ?? (() => []),
      });
      subDispatch(newGroup);
    },
    moveRule(oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean) {
      const g = subQueryRef.value;
      if (!g) return;
      const rawG = toRaw(g);
      subDispatch(move(rawG, oldPath, newPath, { clone, combinators, idGenerator: generateID }));
    },
    groupRule: () => {},
  };
});

const subContextRef = computed(() => {
  const parent = contextRef?.value as { schema?: unknown; translations?: unknown } | undefined;
  return {
    ...(contextRef?.value ?? {}),
    schema: schemaRef,
    translations: parent?.translations,
    actions: subActions.value,
  };
});

provide(QUERY_REF_KEY, subQueryRef);
provide(DISPATCH_KEY, subDispatch);
provide(QUERY_BUILDER_CONTEXT_KEY, subContextRef);
</script>

<template>
  <slot v-if="subQueryRef" />
</template>
