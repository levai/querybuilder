<script setup lang="ts">
import { computed, inject } from 'vue';
import { isRuleGroup, pathsAreEqual, TestID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { useRuleGroup, type UseRuleGroupPathOptions } from '../composables/useRuleGroup';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import Rule from './Rule.vue';
import ValueSelector from './ValueSelector.vue';
import NotToggle from './NotToggle.vue';
import ActionElement from './ActionElement.vue';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import InlineCombinator from './InlineCombinator.vue';

const props = defineProps<UseRuleGroupPathOptions>();

const ctx = inject(QUERY_BUILDER_CONTEXT_KEY);
const schemaVal = computed(() => (ctx?.value as { schema?: { value?: { showNotToggle?: boolean; showShiftActions?: boolean; enableDragAndDrop?: boolean; showCloneButtons?: boolean; showMuteButtons?: boolean; showCombinatorsBetweenRules?: boolean; independentCombinators?: boolean; controls?: unknown } } })?.schema?.value);
const translationsVal = computed(() => (ctx?.value as { translations?: { value?: Record<string, unknown> } })?.translations?.value ?? {});

const r = useRuleGroup(props);

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}
const outerClass = computed(() => (unwrapRef(r.outerClassName) ?? '') as string);
const groupId = computed(() => (unwrapRef(r.id) ?? '') as string);
const classNamesVal = computed(() => (unwrapRef(r.classNames) ?? {}) as Record<string, string>);
const disabledVal = computed(() => !!unwrapRef(r.disabled));
const parentDisabledVal = computed(() => !!unwrapRef(r.parentDisabled));
const parentMutedVal = computed(() => !!unwrapRef(r.parentMuted));
const combinatorVal = computed(() => (unwrapRef(r.combinator) ?? '') as string);
const ruleGroupVal = computed(() => unwrapRef(r.ruleGroup) as RuleGroupTypeAny | null);
const rulesArray = computed(() => ruleGroupVal.value?.rules ?? []);
const pathsMemoArray = computed(() => (unwrapRef(r.pathsMemo) ?? []) as { path: number[]; disabled: boolean }[]);
const schemaUnwrapped = computed(() => {
  const s = (r.schema as { value?: { combinators?: unknown[]; showLockButtons?: boolean; controls?: { ruleGroup?: unknown } } })?.value ?? r.schema;
  return s ?? {};
});
const schemaValForControls = computed(() => schemaUnwrapped.value as { controls?: { ruleGroup?: unknown }; combinators?: unknown[]; showLockButtons?: boolean; showCombinatorsBetweenRules?: boolean; independentCombinators?: boolean } | undefined);
const showCombinatorsBetweenRulesVal = computed(() => !!schemaValForControls.value?.showCombinatorsBetweenRules);
const independentCombinatorsVal = computed(() => !!schemaValForControls.value?.independentCombinators);
const RuleGroupRecursive = computed(() => schemaValForControls.value?.controls?.ruleGroup);
const combinatorsList = computed(() => (schemaValForControls.value?.combinators ?? []) as { name: string; label: string }[]);
const showLockButtonsVal = computed(() => !!schemaValForControls.value?.showLockButtons);

const combinatorTitle = computed(() => (translationsVal.value?.combinators as { title?: string })?.title ?? '');
const addRuleLabel = computed(() => (translationsVal.value?.addRule as { label?: string })?.label ?? '');
const addRuleTitle = computed(() => (translationsVal.value?.addRule as { title?: string })?.title ?? '');
const addGroupLabel = computed(() => (translationsVal.value?.addGroup as { label?: string })?.label ?? '');
const addGroupTitle = computed(() => (translationsVal.value?.addGroup as { title?: string })?.title ?? '');
const lockLabel = computed(() => (disabledVal.value ? (translationsVal.value?.lockGroupDisabled as { label?: string })?.label : (translationsVal.value?.lockGroup as { label?: string })?.label) ?? '');
const lockTitle = computed(() => (disabledVal.value ? (translationsVal.value?.lockGroupDisabled as { title?: string })?.title : (translationsVal.value?.lockGroup as { title?: string })?.title) ?? '');
const removeGroupLabel = computed(() => (translationsVal.value?.removeGroup as { label?: string })?.label ?? '');
const removeGroupTitle = computed(() => (translationsVal.value?.removeGroup as { title?: string })?.title ?? '');
const showShiftActionsVal = computed(() => !!schemaVal.value?.showShiftActions && props.path.length > 0);
const enableDragAndDropVal = computed(() => !!schemaVal.value?.enableDragAndDrop && props.path.length > 0);
const showCloneButtonsVal = computed(() => !!schemaVal.value?.showCloneButtons && props.path.length > 0);
const showMuteButtonsVal = computed(() => !!schemaVal.value?.showMuteButtons);
const cloneGroupLabel = computed(() => (translationsVal.value?.cloneRuleGroup as { label?: string })?.label ?? '⧉');
const cloneGroupTitle = computed(() => (translationsVal.value?.cloneRuleGroup as { title?: string })?.title ?? 'Clone group');
const groupMuted = computed(() => !!ruleGroupVal.value?.muted);
const accessibleDescription = computed(() => (unwrapRef(r.accessibleDescription) ?? '') as string);
const muteGroupLabel = computed(() => (groupMuted.value ? (translationsVal.value?.unmuteGroup as { label?: string })?.label : (translationsVal.value?.muteGroup as { label?: string })?.label) ?? '');
const muteGroupTitle = computed(() => (groupMuted.value ? (translationsVal.value?.unmuteGroup as { title?: string })?.title : (translationsVal.value?.muteGroup as { title?: string })?.title) ?? '');
const shiftLabels = computed(() => ({
  shiftUp: (translationsVal.value?.shiftActionUp as { label?: string })?.label ?? '˄',
  shiftDown: (translationsVal.value?.shiftActionDown as { label?: string })?.label ?? '˅',
}));
const shiftTitles = computed(() => ({
  shiftUp: (translationsVal.value?.shiftActionUp as { title?: string })?.title ?? 'Shift up',
  shiftDown: (translationsVal.value?.shiftActionDown as { title?: string })?.title ?? 'Shift down',
}));
const dragHandleLabel = computed(() => (translationsVal.value?.dragHandle as { label?: string })?.label ?? '⁞⁞');
const dragHandleTitle = computed(() => (translationsVal.value?.dragHandle as { title?: string })?.title ?? 'Drag handle');

function pathAt(idx: number) {
  const p = pathsMemoArray.value[idx]?.path;
  return p ?? [...props.path, idx];
}
function disabledAt(idx: number) {
  return pathsMemoArray.value[idx]?.disabled ?? false;
}
function childKey(child: unknown, idx: number) {
  if (typeof child === 'string') return [...pathAt(idx), child].join('-');
  return (child as RuleType | RuleGroupTypeAny).id;
}
function shiftDownDisabledAt(idx: number) {
  return props.path.length === 0 && idx === rulesArray.value.length - 1;
}
</script>

<template>
  <div
    :class="outerClass"
    :title="accessibleDescription"
    :data-testid="TestID.ruleGroup"
    :data-not="ruleGroupVal?.not ? 'true' : undefined"
    :data-rule-group-id="groupId"
    :data-level="props.path.length"
    :data-path="JSON.stringify(props.path)"
  >
    <div :class="classNamesVal.header">
      <ShiftActions
        v-if="showShiftActionsVal"
        :test-id="TestID.shiftActions"
        :shift-up="r.shiftGroupUp"
        :shift-down="r.shiftGroupDown"
        :shift-up-disabled="unwrapRef(r.shiftUpDisabled)"
        :shift-down-disabled="unwrapRef(r.shiftDownDisabled)"
        :labels="shiftLabels"
        :titles="shiftTitles"
        :class-name="classNamesVal.shiftActions"
        :disabled="disabledVal"
      />
      <DragHandle
        v-if="enableDragAndDropVal"
        :test-id="TestID.dragHandle"
        :label="dragHandleLabel"
        :title="dragHandleTitle"
        :class-name="classNamesVal.dragHandle"
        :disabled="disabledVal"
      />
      <ValueSelector
        v-if="combinatorVal !== undefined"
        :value="combinatorVal"
        :options="combinatorsList"
        :test-id="TestID.combinators"
        :title="combinatorTitle"
        :class-name="classNamesVal.combinators"
        :disabled="disabledVal"
        :handle-on-change="(v: string | string[]) => r.onCombinatorChange(Array.isArray(v) ? v[0] : v)"
      />
      <NotToggle
        v-if="schemaVal?.showNotToggle"
        :test-id="TestID.notToggle"
        :checked="!!ruleGroupVal?.not"
        :class-name="classNamesVal.notToggle"
        :disabled="disabledVal"
        :handle-on-change="r.onNotToggleChange"
      />
      <ActionElement
        :test-id="TestID.addRule"
        :label="addRuleLabel"
        :title="addRuleTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.addRule"
        :handle-on-click="r.addRule"
      />
      <ActionElement
        :test-id="TestID.addGroup"
        :label="addGroupLabel"
        :title="addGroupTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.addGroup"
        :handle-on-click="r.addGroup"
      />
      <ActionElement
        v-if="showCloneButtonsVal"
        :test-id="TestID.cloneGroup"
        :label="cloneGroupLabel"
        :title="cloneGroupTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.cloneGroup"
        :handle-on-click="r.cloneGroup"
      />
      <ActionElement
        v-if="showLockButtonsVal"
        :test-id="TestID.lockGroup"
        :label="lockLabel"
        :title="lockTitle"
        :disabled="parentDisabledVal"
        :class-name="classNamesVal.lockGroup"
        :handle-on-click="r.toggleLockGroup"
      />
      <ActionElement
        v-if="showMuteButtonsVal"
        :test-id="TestID.muteGroup"
        :label="muteGroupLabel"
        :title="muteGroupTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.muteGroup"
        :handle-on-click="r.toggleMuteGroup"
      />
      <ActionElement
        v-if="props.path.length > 0"
        :test-id="TestID.removeGroup"
        :label="removeGroupLabel"
        :title="removeGroupTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.removeGroup"
        :handle-on-click="r.removeGroup"
      />
    </div>
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
          :context="props.context"
        />
        <Rule
          v-else-if="typeof child !== 'string'"
          :path="pathAt(idx)"
          :disabled="disabledAt(idx)"
          :parent-disabled="parentDisabledVal || disabledVal"
          :parent-muted="parentMutedVal"
          :shift-up-disabled="pathsAreEqual([0], pathAt(idx))"
          :shift-down-disabled="shiftDownDisabledAt(idx)"
          :context="props.context"
        />
      </template>
    </div>
  </div>
</template>
