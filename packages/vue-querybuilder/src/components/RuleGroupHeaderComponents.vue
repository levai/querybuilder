<script setup lang="ts">
import type { Component } from 'vue';
import { computed } from 'vue';
import { TestID } from '@react-querybuilder/core';
import { useRuleGroupUnwrapped } from '../composables/useRuleGroupUnwrapped';
import ValueSelector from './ValueSelector.vue';
import NotToggle from './NotToggle.vue';
import ActionElement from './ActionElement.vue';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';

const defaultControls = {
  shiftActions: ShiftActions,
  dragHandle: DragHandle,
  combinatorSelector: ValueSelector,
  notToggle: NotToggle,
  actionElement: ActionElement,
};

const props = withDefaults(
  defineProps<{
    rg: unknown;
    dragHandleRef?: import('vue').Ref<HTMLElement | null>;
    onDragStart?: (e: DragEvent) => void;
    onDragEnd?: (e: DragEvent) => void;
  }>(),
  { dragHandleRef: undefined, onDragStart: undefined, onDragEnd: undefined }
);

const scope = useRuleGroupUnwrapped(computed(() => props.rg));

const schemaValUnwrapped = computed(() => scope.schemaVal.value as Record<string, unknown> | undefined);
const pathLength = computed(() => (Array.isArray(scope.path.value) ? scope.path.value.length : 0));
const showShiftActionsVal = computed(() => !!schemaValUnwrapped.value?.showShiftActions && pathLength.value > 0);
const enableDropTargetsVal = computed(() => !!schemaValUnwrapped.value?.enableDragAndDrop);
const showGroupDragHandleVal = computed(() => enableDropTargetsVal.value && pathLength.value > 0);
const showCloneButtonsVal = computed(() => !!schemaValUnwrapped.value?.showCloneButtons && pathLength.value > 0);
const showMuteButtonsVal = computed(() => !!schemaValUnwrapped.value?.showMuteButtons);

const combinatorTitle = computed(() => (scope.translationsVal.value?.combinators as { title?: string })?.title ?? '');
const addRuleLabel = computed(() => (scope.translationsVal.value?.addRule as { label?: string })?.label ?? '');
const addRuleTitle = computed(() => (scope.translationsVal.value?.addRule as { title?: string })?.title ?? '');
const addGroupLabel = computed(() => (scope.translationsVal.value?.addGroup as { label?: string })?.label ?? '');
const addGroupTitle = computed(() => (scope.translationsVal.value?.addGroup as { title?: string })?.title ?? '');
const lockLabel = computed(
  () =>
    (scope.disabledVal.value
      ? (scope.translationsVal.value?.lockGroupDisabled as { label?: string })?.label
      : (scope.translationsVal.value?.lockGroup as { label?: string })?.label) ?? ''
);
const lockTitle = computed(
  () =>
    (scope.disabledVal.value
      ? (scope.translationsVal.value?.lockGroupDisabled as { title?: string })?.title
      : (scope.translationsVal.value?.lockGroup as { title?: string })?.title) ?? ''
);
const removeGroupLabel = computed(() => (scope.translationsVal.value?.removeGroup as { label?: string })?.label ?? '');
const removeGroupTitle = computed(() => (scope.translationsVal.value?.removeGroup as { title?: string })?.title ?? '');
const cloneGroupLabel = computed(() => (scope.translationsVal.value?.cloneRuleGroup as { label?: string })?.label ?? '⧉');
const cloneGroupTitle = computed(() => (scope.translationsVal.value?.cloneRuleGroup as { title?: string })?.title ?? 'Clone group');
const groupMuted = computed(() => !!(scope.ruleGroupVal.value as { muted?: boolean } | null)?.muted);
const muteGroupLabel = computed(
  () =>
    (groupMuted.value
      ? (scope.translationsVal.value?.unmuteGroup as { label?: string })?.label
      : (scope.translationsVal.value?.muteGroup as { label?: string })?.label) ?? ''
);
const muteGroupTitle = computed(
  () =>
    (groupMuted.value
      ? (scope.translationsVal.value?.unmuteGroup as { title?: string })?.title
      : (scope.translationsVal.value?.muteGroup as { title?: string })?.title) ?? ''
);
const shiftLabels = computed(() => ({
  shiftUp: (scope.translationsVal.value?.shiftActionUp as { label?: string })?.label ?? '˄',
  shiftDown: (scope.translationsVal.value?.shiftActionDown as { label?: string })?.label ?? '˅',
}));
const shiftTitles = computed(() => ({
  shiftUp: (scope.translationsVal.value?.shiftActionUp as { title?: string })?.title ?? 'Shift up',
  shiftDown: (scope.translationsVal.value?.shiftActionDown as { title?: string })?.title ?? 'Shift down',
}));
const dragHandleLabel = computed(() => (scope.translationsVal.value?.dragHandle as { label?: string })?.label ?? '⁞⁞');
const dragHandleTitle = computed(() => (scope.translationsVal.value?.dragHandle as { title?: string })?.title ?? 'Drag handle');
const notToggleLabel = computed(() => (scope.translationsVal.value?.notToggle as { label?: string })?.label ?? 'Not');
const notToggleTitle = computed(() => (scope.translationsVal.value?.notToggle as { title?: string })?.title ?? 'Invert this group');

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}
const rgVal = scope.rg.value as { shiftGroupUp?: () => void; shiftGroupDown?: () => void; shiftUpDisabled?: unknown; shiftDownDisabled?: unknown; onCombinatorChange?: (v: string) => void; onNotToggleChange?: (c: boolean) => void; addRule?: () => void; addGroup?: () => void; cloneGroup?: () => void; toggleLockGroup?: () => void; toggleMuteGroup?: () => void; removeGroup?: () => void } | undefined;

const cn = computed(() => scope.classNamesVal.value);
const disabledVal = computed(() => scope.disabledVal.value);
const parentDisabledVal = computed(() => scope.parentDisabledVal.value);
const combinatorVal = computed(() => scope.combinatorVal.value);
const combinatorsList = computed(() => scope.combinatorsList.value);
const showNotToggle = computed(() => !!schemaValUnwrapped.value?.showNotToggle);
const ruleGroupNot = computed(() => !!(scope.ruleGroupVal.value as { not?: boolean } | null)?.not);
const showLockButtonsVal = computed(() => scope.showLockButtonsVal.value);

function onNotToggleChange(checked: boolean) {
  rgVal?.onNotToggleChange?.(checked);
}
function onCombinatorChange(v: string | string[]) {
  rgVal?.onCombinatorChange?.(Array.isArray(v) ? v[0] : v);
}
function onAddRule() {
  rgVal?.addRule?.();
}
function onAddGroup() {
  rgVal?.addGroup?.();
}
function onCloneGroup() {
  rgVal?.cloneGroup?.();
}
function onToggleLockGroup() {
  rgVal?.toggleLockGroup?.();
}
function onToggleMuteGroup() {
  rgVal?.toggleMuteGroup?.();
}
function onRemoveGroup() {
  rgVal?.removeGroup?.();
}

/** 从 schema.controls 取组件，未提供时用默认组件（与 React 一致，便于 UI 库覆盖） */
const controls = computed(() => {
  const c = (scope.schemaVal.value as { controls?: Record<string, Component> } | undefined)?.controls;
  if (!c) return defaultControls;
  return {
    shiftActions: (c.shiftActions as Component) ?? defaultControls.shiftActions,
    dragHandle: (c.dragHandle as Component) ?? defaultControls.dragHandle,
    combinatorSelector: (c.combinatorSelector as Component) ?? defaultControls.combinatorSelector,
    notToggle: (c.notToggle as Component) ?? defaultControls.notToggle,
    actionElement: (c.actionElement as Component) ?? defaultControls.actionElement,
  };
});
</script>

<template>
  <component
    v-if="showShiftActionsVal && rgVal"
    :is="controls.shiftActions"
    :test-id="TestID.shiftActions"
    :shift-up="rgVal.shiftGroupUp!"
    :shift-down="rgVal.shiftGroupDown!"
    :shift-up-disabled="!!unwrapRef(rgVal.shiftUpDisabled)"
    :shift-down-disabled="!!unwrapRef(rgVal.shiftDownDisabled)"
    :labels="shiftLabels"
    :titles="shiftTitles"
    :class-name="cn.shiftActions"
    :disabled="disabledVal"
  />
  <span
    v-if="showGroupDragHandleVal"
    :ref="dragHandleRef"
    draggable="true"
    role="button"
    tabindex="-1"
    aria-label="Drag handle"
    @dragstart="onDragStart?.(($event as DragEvent))"
    @dragend="onDragEnd?.(($event as DragEvent))"
  >
    <component
      :is="controls.dragHandle"
      :test-id="TestID.dragHandle"
      :label="dragHandleLabel"
      :title="dragHandleTitle"
      :class-name="cn.dragHandle"
      :disabled="disabledVal"
    />
  </span>
  <component
    v-if="combinatorVal !== undefined && rgVal"
    :is="controls.combinatorSelector"
    :value="combinatorVal"
    :options="combinatorsList"
    :test-id="TestID.combinators"
    :title="combinatorTitle"
    :class-name="cn.combinators"
    :disabled="disabledVal"
    :handle-on-change="onCombinatorChange"
  />
  <component
    v-if="showNotToggle && rgVal"
    :is="controls.notToggle"
    :test-id="TestID.notToggle"
    :checked="ruleGroupNot"
    :class-name="cn.notToggle"
    :disabled="disabledVal"
    :label="notToggleLabel"
    :title="notToggleTitle"
    :handle-on-change="onNotToggleChange"
  />
  <component
    v-if="rgVal"
    :is="controls.actionElement"
    :test-id="TestID.addRule"
    :label="addRuleLabel"
    :title="addRuleTitle"
    :disabled="disabledVal"
    :class-name="cn.addRule"
    :handle-on-click="onAddRule"
  />
  <component
    v-if="rgVal"
    :is="controls.actionElement"
    :test-id="TestID.addGroup"
    :label="addGroupLabel"
    :title="addGroupTitle"
    :disabled="disabledVal"
    :class-name="cn.addGroup"
    :handle-on-click="onAddGroup"
  />
  <component
    v-if="showCloneButtonsVal && rgVal"
    :is="controls.actionElement"
    :test-id="TestID.cloneGroup"
    :label="cloneGroupLabel"
    :title="cloneGroupTitle"
    :disabled="disabledVal"
    :class-name="cn.cloneGroup"
    :handle-on-click="onCloneGroup"
  />
  <component
    v-if="showLockButtonsVal && rgVal"
    :is="controls.actionElement"
    :test-id="TestID.lockGroup"
    :label="lockLabel"
    :title="lockTitle"
    :rule-or-group="scope.ruleGroupVal"
    :disabled="parentDisabledVal"
    :class-name="cn.lockGroup"
    :handle-on-click="onToggleLockGroup"
  />
  <component
    v-if="showMuteButtonsVal && rgVal"
    :is="controls.actionElement"
    :test-id="TestID.muteGroup"
    :label="muteGroupLabel"
    :title="muteGroupTitle"
    :rule-or-group="scope.ruleGroupVal"
    :disabled="disabledVal"
    :class-name="cn.muteGroup"
    :handle-on-click="onToggleMuteGroup"
  />
  <component
    v-if="pathLength > 0 && rgVal"
    :is="controls.actionElement"
    :test-id="TestID.removeGroup"
    :label="removeGroupLabel"
    :title="removeGroupTitle"
    :disabled="disabledVal"
    :class-name="cn.removeGroup"
    :handle-on-click="onRemoveGroup"
  />
</template>
