<script setup lang="ts">
import type { Component } from 'vue';
import { computed } from 'vue';
import { isRuleGroup, pathsAreEqual, TestID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { useRuleGroupUnwrapped } from '../composables/useRuleGroupUnwrapped';
import Rule from './Rule.vue';
import InlineCombinator from './InlineCombinator.vue';

const defaultControls = {
  rule: Rule,
  inlineCombinator: InlineCombinator,
};

const props = withDefaults(
  defineProps<{
    rg: unknown;
    context?: unknown;
  }>(),
  { context: undefined }
);

const scope = useRuleGroupUnwrapped(computed(() => props.rg));

const schemaValUnwrapped = computed(() => scope.schemaVal.value as Record<string, unknown> | undefined);
const rulesArray = computed(() => (scope.ruleGroupVal.value as { rules?: (string | RuleType | RuleGroupTypeAny)[] } | null)?.rules ?? []);
const enableDropTargetsVal = computed(() => !!schemaValUnwrapped.value?.enableDragAndDrop);
const pathArray = computed(() => (Array.isArray(scope.path.value) ? scope.path.value : []));
const cn = computed(() => scope.classNamesVal.value);
const combinatorVal = computed(() => scope.combinatorVal.value);
const combinatorsList = computed(() => scope.combinatorsList.value);
const translationsVal = computed(() => scope.translationsVal.value);
const disabledVal = computed(() => scope.disabledVal.value);
const parentDisabledVal = computed(() => scope.parentDisabledVal.value);
const parentMutedVal = computed(() => scope.parentMutedVal.value);
const independentCombinatorsVal = computed(() => scope.independentCombinatorsVal.value);
const showCombinatorsBetweenRulesVal = computed(() => scope.showCombinatorsBetweenRulesVal.value);
const RuleGroupRecursive = computed(() => scope.RuleGroupRecursive.value);

function pathAt(idx: number) {
  const p = scope.pathsMemoArray.value[idx]?.path;
  return p ?? [...pathArray.value, idx];
}
function disabledAt(idx: number) {
  return scope.pathsMemoArray.value[idx]?.disabled ?? false;
}
function childKey(child: unknown, idx: number) {
  if (typeof child === 'string') return [...pathAt(idx), child].join('-');
  return (child as RuleType | RuleGroupTypeAny).id;
}
function shiftDownDisabledAt(idx: number) {
  return pathArray.value.length === 0 && idx === rulesArray.value.length - 1;
}

const rgVal = scope.rg.value as { onCombinatorChange?: (v: string) => void; onIndependentCombinatorChange?: (v: string, idx: number) => void } | undefined;

const combinatorTitle = computed(() => {
  const c = translationsVal.value?.combinators as { title?: string } | undefined;
  return c?.title ?? '';
});
function onCombinatorChange(v: string) {
  rgVal?.onCombinatorChange?.(v);
}
function onIndependentCombinatorChange(v: string, idx: number) {
  rgVal?.onIndependentCombinatorChange?.(v, idx);
}

/** 从 schema.controls 取组件，未提供时用默认组件（与 React 一致，便于 UI 库覆盖） */
const controls = computed(() => {
  const c = (scope.schemaVal.value as { controls?: Record<string, Component> } | undefined)?.controls;
  if (!c) return defaultControls;
  return {
    rule: (c.rule as Component) ?? defaultControls.rule,
    inlineCombinator: (c.inlineCombinator as Component) ?? defaultControls.inlineCombinator,
  };
});
</script>

<template>
  <template v-for="(child, idx) in rulesArray" :key="childKey(child, idx)">
    <template v-if="!independentCombinatorsVal && showCombinatorsBetweenRulesVal && idx > 0">
      <component
        :is="controls.inlineCombinator"
        :value="combinatorVal"
        :options="combinatorsList"
        :test-id="TestID.inlineCombinator"
        :title="combinatorTitle"
        :class-name="cn.combinators"
        :between-rules-class-name="cn.betweenRules"
        :disabled="disabledVal"
        :handle-on-change="onCombinatorChange"
        :dnd-path="enableDropTargetsVal ? pathAt(idx) : undefined"
        :dnd-rules="enableDropTargetsVal ? rulesArray : undefined"
      />
    </template>
    <component
      v-if="typeof child === 'string'"
      :is="controls.inlineCombinator"
      :value="child"
      :options="combinatorsList"
      :test-id="TestID.inlineCombinator"
      :title="combinatorTitle"
      :class-name="cn.combinators"
      :between-rules-class-name="cn.betweenRules"
      :disabled="disabledAt(idx)"
      :handle-on-change="(v: string) => onIndependentCombinatorChange(v, idx)"
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
      :context="context"
    />
    <component
      v-else-if="typeof child !== 'string'"
      :is="controls.rule"
      :path="pathAt(idx)"
      :disabled="disabledAt(idx)"
      :parent-disabled="parentDisabledVal || disabledVal"
      :parent-muted="parentMutedVal"
      :shift-up-disabled="pathsAreEqual([0], pathAt(idx))"
      :shift-down-disabled="shiftDownDisabledAt(idx)"
      :context="context"
    />
  </template>
</template>
