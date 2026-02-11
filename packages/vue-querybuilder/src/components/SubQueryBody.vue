<script setup lang="ts">
import { computed, inject } from 'vue';
import { isRuleGroup, pathsAreEqual, rootPath, TestID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { useRuleGroup } from '../composables/useRuleGroup';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import Rule from './Rule.vue';
import RuleGroup from './RuleGroup.vue';
import InlineCombinator from './InlineCombinator.vue';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    parentDisabled?: boolean;
  }>(),
  { disabled: false, parentDisabled: false }
);

const r = useRuleGroup({
  path: rootPath,
  disabled: props.disabled,
  parentDisabled: props.parentDisabled,
  parentMuted: false,
  shiftUpDisabled: true,
  shiftDownDisabled: true,
});

const ctx = inject(QUERY_BUILDER_CONTEXT_KEY);
const schemaValForControls = computed(() => {
  const ctxVal = ctx?.value as { schema?: { value?: { showCombinatorsBetweenRules?: boolean; independentCombinators?: boolean; controls?: unknown; combinators?: unknown[] } } };
  const s = ctxVal?.schema?.value ?? {};
  return s as { showCombinatorsBetweenRules?: boolean; independentCombinators?: boolean; controls?: { ruleGroup?: unknown }; combinators?: { name: string; label: string }[] };
});
const translationsVal = computed(() => (ctx?.value as { translations?: { value?: Record<string, unknown> } })?.translations?.value ?? {});

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}
const classNamesVal = computed(() => (unwrapRef(r.classNames) ?? {}) as Record<string, string>);
const disabledVal = computed(() => !!unwrapRef(r.disabled));
const parentDisabledVal = computed(() => !!unwrapRef(r.parentDisabled));
const parentMutedVal = computed(() => !!unwrapRef(r.parentMuted));
const combinatorVal = computed(() => (unwrapRef(r.combinator) ?? '') as string);
const ruleGroupVal = computed(() => unwrapRef(r.ruleGroup) as RuleGroupTypeAny | null);
const rulesArray = computed(() => ruleGroupVal.value?.rules ?? []);
const pathsMemoArray = computed(() => (unwrapRef(r.pathsMemo) ?? []) as { path: number[]; disabled: boolean }[]);
const showCombinatorsBetweenRulesVal = computed(() => !!schemaValForControls.value?.showCombinatorsBetweenRules);
const independentCombinatorsVal = computed(() => !!schemaValForControls.value?.independentCombinators);
const RuleGroupRecursive = computed(() => schemaValForControls.value?.controls?.ruleGroup ?? RuleGroup);
const combinatorsList = computed(() => (schemaValForControls.value?.combinators ?? []) as { name: string; label: string }[]);
const combinatorTitle = computed(() => (translationsVal.value?.combinators as { title?: string })?.title ?? '');

function pathAt(idx: number) {
  const p = pathsMemoArray.value[idx]?.path;
  return p ?? [idx];
}
function disabledAt(idx: number) {
  return pathsMemoArray.value[idx]?.disabled ?? false;
}
function childKey(child: unknown, idx: number) {
  if (typeof child === 'string') return [...pathAt(idx), child].join('-');
  return (child as RuleType | RuleGroupTypeAny).id;
}
function shiftDownDisabledAt(idx: number) {
  return idx === rulesArray.value.length - 1;
}
</script>

<template>
  <div :class="classNamesVal.body">
    <template v-for="(child, idx) in rulesArray" :key="childKey(child, idx)">
      <template v-if="!independentCombinatorsVal && showCombinatorsBetweenRulesVal && idx > 0">
        <InlineCombinator
          :value="combinatorVal"
          :options="combinatorsList"
          :test-id="TestID.inlineCombinator"
          :title="combinatorTitle"
          :class-name="classNamesVal.combinators"
          :disabled="disabledVal"
          :handle-on-change="(v: string) => r.onCombinatorChange(v)"
        />
      </template>
      <InlineCombinator
        v-if="typeof child === 'string'"
        :value="child"
        :options="combinatorsList"
        :test-id="TestID.inlineCombinator"
        :title="combinatorTitle"
        :class-name="classNamesVal.combinators"
        :disabled="disabledAt(idx)"
        :handle-on-change="(v: string) => r.onIndependentCombinatorChange(v, idx)"
      />
      <component
        v-else-if="isRuleGroup(child)"
        :is="RuleGroupRecursive"
        :path="pathAt(idx)"
        :disabled="disabledAt(idx)"
        :parent-disabled="parentDisabledVal || disabledVal"
        :parent-muted="parentMutedVal"
        :shift-up-disabled="pathsAreEqual([0], pathAt(idx))"
        :shift-down-disabled="shiftDownDisabledAt(idx)"
      />
      <Rule
        v-else-if="typeof child !== 'string'"
        :path="pathAt(idx)"
        :disabled="disabledAt(idx)"
        :parent-disabled="parentDisabledVal || disabledVal"
        :parent-muted="parentMutedVal"
        :shift-up-disabled="pathsAreEqual([0], pathAt(idx))"
        :shift-down-disabled="shiftDownDisabledAt(idx)"
      />
    </template>
  </div>
</template>
