<script setup lang="ts">
import { computed, provide, markRaw, unref } from 'vue';
import { isRuleGroup, prepareRuleGroup, generateID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { useQueryBuilder } from '../composables/useQueryBuilder';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import RuleGroup from './RuleGroup.vue';
import type { QueryBuilderProps, QueryBuilderContextValue } from '../types';
import type { Ref } from 'vue';

const props = defineProps<{
  /** 子查询的 query（RuleGroup），即 rule.value */
  subqueryValue?: RuleGroupTypeAny;
  /** 父级 context（支持 Ref 以便响应式） */
  parentContext: Ref<QueryBuilderContextValue> | QueryBuilderContextValue;
  disabled?: boolean;
  /** 子 query 变更时回调，用于更新 rule.value */
  onSubqueryChange: (query: RuleGroupTypeAny) => void;
  /** 是否在挂载时触发 onSubqueryChange（与 enableMountQueryChange 对齐） */
  enableMountQueryChange?: boolean;
}>();

const parentContextResolved = computed(() => unref(props.parentContext));

const initialQuery = computed(() =>
  prepareRuleGroup({ combinator: 'and', rules: [] }, { idGenerator: () => generateID() })
);

const subqueryQuery = computed(() => {
  const value = props.subqueryValue;
  if (value && isRuleGroup(value) && value.id) {
    return value;
  }
  return initialQuery.value;
});

// 使用 getter 使 useQueryBuilder 每次读取都拿到最新 context 与 modelValue
const subqueryProps: QueryBuilderProps = {
  get modelValue() {
    return subqueryQuery.value;
  },
  get fields() {
    return parentContextResolved.value.fields;
  },
  get operators() {
    return parentContextResolved.value.operators;
  },
  get combinators() {
    return parentContextResolved.value.combinators;
  },
  get showNotToggle() {
    return parentContextResolved.value.showNotToggle;
  },
  get showShiftActions() {
    return parentContextResolved.value.showShiftActions;
  },
  get showCloneButtons() {
    return parentContextResolved.value.showCloneButtons;
  },
  get showLockButtons() {
    return parentContextResolved.value.showLockButtons;
  },
  get showMuteButtons() {
    return parentContextResolved.value.showMuteButtons;
  },
  get showCombinatorsBetweenRules() {
    return parentContextResolved.value.showCombinatorsBetweenRules;
  },
  get independentCombinators() {
    return parentContextResolved.value.independentCombinators;
  },
  get disabled() {
    return props.disabled ?? false;
  },
  get autoSelectField() {
    return parentContextResolved.value.autoSelectField;
  },
  get autoSelectOperator() {
    return parentContextResolved.value.autoSelectOperator;
  },
  get addRuleToNewGroups() {
    return parentContextResolved.value.addRuleToNewGroups;
  },
  get enableDragAndDrop() {
    return parentContextResolved.value.enableDragAndDrop;
  },
  get maxLevels() {
    return parentContextResolved.value.maxLevels;
  },
  enableMountQueryChange: props.enableMountQueryChange ?? true,
  get controls() {
    const c = parentContextResolved.value.controls;
    return c ? markRaw(c) : undefined;
  },
  get translations() {
    return parentContextResolved.value.translations;
  },
  get classnames() {
    return parentContextResolved.value.classnames;
  },
  get getRuleClassname() {
    return parentContextResolved.value.getRuleClassname;
  },
  get getRuleGroupClassname() {
    return parentContextResolved.value.getRuleGroupClassname;
  },
  get validator() {
    return parentContextResolved.value.validator;
  },
  get getValueSources() {
    return parentContextResolved.value.getValueSources;
  },
  get getSubQueryBuilderProps() {
    return parentContextResolved.value.getSubQueryBuilderProps;
  },
  onUpdateModelValue: (q: RuleGroupTypeAny) => {
    props.onSubqueryChange(q);
  },
};

const { contextValue } = useQueryBuilder(subqueryProps);
provide(QUERY_BUILDER_CONTEXT_KEY, contextValue);

const ruleGroup = computed(() => subqueryQuery.value);
</script>

<template>
  <div :class="parentContextResolved.classnames?.value">
    <RuleGroup
      v-if="ruleGroup"
      :id="'id' in ruleGroup ? ruleGroup.id : undefined"
      :path="[]"
      :rule-group="ruleGroup"
      :disabled="disabled || parentContextResolved.disabled"
      :parent-disabled="!!disabled"
    />
  </div>
</template>
