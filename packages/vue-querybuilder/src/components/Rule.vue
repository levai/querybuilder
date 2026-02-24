<script setup lang="ts">
import type { Component } from 'vue';
import { computed } from 'vue';
import { standardClassnames, TestID } from '@react-querybuilder/core';
import { useRule, type UseRulePathOptions } from '../composables/useRule';
import { useNativeRuleDnD } from '../composables/useNativeRuleDnD';
import { useStopEventPropagation } from '../composables/useStopEventPropagation';
import ValueSelector from './ValueSelector.vue';
import ValueEditor from './ValueEditor.vue';
import ActionElement from './ActionElement.vue';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import MatchModeEditor from './MatchModeEditor.vue';
import SubQueryWrapper from './SubQueryWrapper.vue';
import SubQueryHeader from './SubQueryHeader.vue';
import SubQueryBody from './SubQueryBody.vue';

const defaultControls = {
  shiftActions: ShiftActions,
  dragHandle: DragHandle,
  fieldSelector: ValueSelector,
  operatorSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
  valueEditor: ValueEditor,
  matchModeEditor: MatchModeEditor,
  actionElement: ActionElement,
};

const props = defineProps<UseRulePathOptions>();

const r = useRule(props);

function unwrap<T>(v: T | { value?: T } | undefined): T | undefined {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value;
  return v as T | undefined;
}

const pathArray = computed(() => (unwrap(r.path) ?? []) as number[]);
const ruleId = computed(() => (unwrap(r.id) ?? '') as string);
const outerClass = computed(() => (unwrap(r.outerClassName) ?? '') as string);
const classNamesVal = computed(() => (unwrap(r.classNames) ?? {}) as Record<string, string>);
const ruleData = computed(() => unwrap(r.rule));
const disabledVal = computed(() => !!unwrap(r.disabled));
const parentDisabledVal = computed(() => !!unwrap(r.parentDisabled));
const schemaVal = computed(() => unwrap(r.schema));
const operatorsVal = computed(() => (unwrap(r.operators) ?? []) as { name: string; label: string }[]);
const valuesVal = computed(() => (unwrap(r.values) ?? []) as Array<{ name: string; label: string }> | Array<{ type: 'optgroup'; label: string; options: Array<{ name: string; label: string }> }>);
const valueEditorTypeVal = computed(() => (unwrap(r.valueEditorType) ?? 'text') as string);
const inputTypeVal = computed(() => (unwrap(r.inputType) ?? 'text') as string);
const valueEditorSeparatorVal = computed(() => unwrap(r.valueEditorSeparator) as string | null | undefined);
const fieldDataVal = computed(() => unwrap(r.fieldData));
const hideValueControlsVal = computed(() => !!unwrap(r.hideValueControls));
const showLockButtons = computed(() => !!schemaVal.value?.showLockButtons);
const showShiftActions = computed(() => !!schemaVal.value?.showShiftActions);
const enableDragAndDrop = computed(() => !!schemaVal.value?.enableDragAndDrop);
const showCloneButtons = computed(() => !!schemaVal.value?.showCloneButtons);
const showMuteButtons = computed(() => !!schemaVal.value?.showMuteButtons);
const fieldsList = computed(() => (schemaVal.value?.fields ?? []) as { name: string; label: string }[]);
const valueSourceOptionsVal = computed(() => (unwrap(r.valueSourceOptions) ?? []) as Array<{ name: string; value?: string; label: string }>);
const valueSourcesVal = computed(() => (unwrap(r.valueSources) ?? []) as string[]);
const matchModesVal = computed(() => (unwrap(r.matchModes) ?? []) as Array<{ name: string; label: string }>);
const fieldsPlaceholderName = computed(() => (translationsVal.value?.fields as { placeholderName?: string })?.placeholderName ?? '');
const operatorsPlaceholderName = computed(() => (translationsVal.value?.operators as { placeholderName?: string })?.placeholderName ?? '');
const showMatchModeEditor = computed(() => {
  const auto = !!schemaVal.value?.autoSelectField;
  const fieldSelected = ruleData.value?.field !== fieldsPlaceholderName.value;
  return (auto || fieldSelected) && matchModesVal.value.length > 0;
});
// 与 React 版本一致：当 autoSelectOperator 为 false 且 operator 是 placeholder 时，不显示 ValueEditor 和 ValueSourceSelector
const showValueControls = computed(() => {
  const autoSelectOperator = !!schemaVal.value?.autoSelectOperator;
  const operatorIsPlaceholder = ruleData.value?.operator === operatorsPlaceholderName.value;
  return (autoSelectOperator || !operatorIsPlaceholder) && !hideValueControlsVal.value;
});
const showValueSourceSelector = computed(() => {
  const op = (ruleData.value?.operator ?? '').toString().toLowerCase();
  return !['null', 'notnull'].includes(op) && valueSourcesVal.value.length > 1 && showValueControls.value;
});

const translationsVal = computed(() => (unwrap(r.translations) ?? {}) as Record<string, { label?: string; title?: string } | undefined>);
const lockRuleLabel = computed(() => (disabledVal.value ? translationsVal.value?.lockRuleDisabled?.label : translationsVal.value?.lockRule?.label) ?? (disabledVal.value ? 'Unlock' : 'Lock'));
const lockRuleTitle = computed(() => (disabledVal.value ? translationsVal.value?.lockRuleDisabled?.title : translationsVal.value?.lockRule?.title) ?? (disabledVal.value ? 'Unlock rule' : 'Lock rule'));
const removeRuleLabel = computed(() => translationsVal.value?.removeRule?.label ?? 'Remove');
const removeRuleTitle = computed(() => translationsVal.value?.removeRule?.title ?? 'Remove rule');
const cloneRuleLabel = computed(() => translationsVal.value?.cloneRule?.label ?? '⧉');
const cloneRuleTitle = computed(() => translationsVal.value?.cloneRule?.title ?? 'Clone rule');
const muteRuleLabel = computed(() => (ruleData.value?.muted ? translationsVal.value?.unmuteRule?.label : translationsVal.value?.muteRule?.label) ?? (ruleData.value?.muted ? 'Unmute' : 'Mute'));
const muteRuleTitle = computed(() => (ruleData.value?.muted ? translationsVal.value?.unmuteRule?.title : translationsVal.value?.muteRule?.title) ?? (ruleData.value?.muted ? 'Unmute rule' : 'Mute rule'));
const shiftLabels = computed(() => ({
  shiftUp: translationsVal.value?.shiftActionUp?.label ?? '˄',
  shiftDown: translationsVal.value?.shiftActionDown?.label ?? '˅',
}));
const shiftTitles = computed(() => ({
  shiftUp: translationsVal.value?.shiftActionUp?.title ?? 'Shift up',
  shiftDown: translationsVal.value?.shiftActionDown?.title ?? 'Shift down',
}));
const valueSourceSelectorTitle = computed(() => translationsVal.value?.valueSourceSelector?.title ?? 'Value source');
const matchModeTitle = computed(() => (translationsVal.value?.matchMode as { title?: string })?.title ?? 'Match mode');
// React: defaultMatch = { mode: 'all' }; match 为对象 { mode, threshold? }
const matchValueForEditor = computed(() => {
  const m = ruleData.value?.match;
  if (m && typeof m === 'object' && 'mode' in m) return m;
  const firstMode = matchModesVal.value[0]?.name ?? 'all';
  return { mode: firstMode, threshold: 1 };
});
function onMatchModeChange(v: unknown) {
  const obj = typeof v === 'string' ? { mode: v, threshold: 1 } : (v as { mode: string; threshold?: number });
  r.onChangeMatchMode(obj);
}
const dragHandleLabel = computed(() => translationsVal.value?.dragHandle?.label ?? '⁞⁞');
const dragHandleTitle = computed(() => translationsVal.value?.dragHandle?.title ?? 'Drag handle');

const ruleDnd = useNativeRuleDnD({
  path: pathArray,
  rule: computed(() => ruleData.value ?? null),
  disabled: disabledVal,
});
const ruleDndClass = computed(() => {
  if (!schemaVal.value?.enableDragAndDrop) return '';
  const c: string[] = [];
  if (ruleDnd.isDragging.value && !schemaVal.value?.classNames?.dndDragging) c.push(standardClassnames.dndDragging);
  if (ruleDnd.isOver.value && !schemaVal.value?.classNames?.dndOver) c.push(standardClassnames.dndOver);
  if (ruleDnd.dropNotAllowed.value && !schemaVal.value?.classNames?.dndDropNotAllowed)
    c.push(standardClassnames.dndDropNotAllowed);
  if (ruleDnd.dropEffect.value === 'copy' && ruleDnd.isOver.value) c.push(standardClassnames.dndCopy);
  if (ruleDnd.groupItems.value && ruleDnd.isOver.value) c.push(standardClassnames.dndGroup);
  return c.filter(Boolean).join(' ');
});

const toggleLockRule = useStopEventPropagation(r.toggleLockRule);
const removeRuleFn = useStopEventPropagation(r.removeRule);
const cloneRuleFn = useStopEventPropagation(r.cloneRule);
const toggleMuteRuleFn = useStopEventPropagation(r.toggleMuteRule);

function onFieldChange(v: string | string[]) {
  r.onChangeField(Array.isArray(v) ? v[0] : v);
}
function onOperatorChange(v: string | string[]) {
  r.onChangeOperator(Array.isArray(v) ? v[0] : v);
}
function onValueSourceChange(v: string | string[]) {
  r.onChangeValueSource(Array.isArray(v) ? v[0] : v);
}

/** 从 schema.controls 取组件，未提供时用默认组件（与 React 一致，便于 UI 库覆盖） */
const controls = computed(() => {
  const c = (schemaVal.value as { controls?: Record<string, Component> } | undefined)?.controls;
  if (!c) return defaultControls;
  return {
    shiftActions: (c.shiftActions as Component) ?? defaultControls.shiftActions,
    dragHandle: (c.dragHandle as Component) ?? defaultControls.dragHandle,
    fieldSelector: (c.fieldSelector as Component) ?? defaultControls.fieldSelector,
    operatorSelector: (c.operatorSelector as Component) ?? defaultControls.operatorSelector,
    valueSourceSelector: (c.valueSourceSelector as Component) ?? defaultControls.valueSourceSelector,
    valueEditor: (c.valueEditor as Component) ?? defaultControls.valueEditor,
    matchModeEditor: (c.matchModeEditor as Component) ?? defaultControls.matchModeEditor,
    actionElement: (c.actionElement as Component) ?? defaultControls.actionElement,
  };
});
</script>

<template>
  <div
    ref="ruleDnd.dropRef"
    :data-testid="TestID.rule"
    :class="[outerClass, ruleDndClass]"
    :data-rule-id="ruleId"
    :data-level="pathArray.length"
    :data-path="JSON.stringify(pathArray)"
    @dragover="enableDragAndDrop ? ruleDnd.onDragover($event) : undefined"
    @drop="enableDragAndDrop ? ruleDnd.onDrop($event) : undefined"
    @dragleave="enableDragAndDrop ? ruleDnd.onDragleave($event) : undefined"
  >
    <component
      v-if="showShiftActions"
      :is="controls.shiftActions"
      :test-id="TestID.shiftActions"
      :shift-up="r.shiftRuleUp"
      :shift-down="r.shiftRuleDown"
      :shift-up-disabled="unwrap(r.shiftUpDisabled)"
      :shift-down-disabled="unwrap(r.shiftDownDisabled)"
      :labels="shiftLabels"
      :titles="shiftTitles"
      :class-name="classNamesVal.shiftActions"
      :disabled="disabledVal"
    />
    <span
      v-if="enableDragAndDrop"
      ref="ruleDnd.dragHandleRef"
      draggable="true"
      role="button"
      tabindex="-1"
      aria-label="Drag handle"
      @dragstart="ruleDnd.onDragStart($event)"
      @dragend="ruleDnd.onDragEnd($event)"
    >
      <component
        :is="controls.dragHandle"
        :test-id="TestID.dragHandle"
        :label="dragHandleLabel"
        :title="dragHandleTitle"
        :class-name="classNamesVal.dragHandle"
        :disabled="disabledVal"
      />
    </span>
    <component
      :is="controls.fieldSelector"
      :value="ruleData?.field"
      :options="fieldsList"
      :test-id="TestID.fields"
      title="Field"
      :disabled="disabledVal"
      :class-name="classNamesVal.fields"
      :handle-on-change="onFieldChange"
    />
    <component
      v-if="showMatchModeEditor"
      :is="controls.matchModeEditor"
      :value="matchValueForEditor"
      :options="matchModesVal"
      :test-id="TestID.matchModeEditor"
      :title="matchModeTitle"
      :class-name="classNamesVal.matchMode"
      :disabled="disabledVal"
      :handle-on-change="onMatchModeChange"
    />
    <SubQueryWrapper
      v-if="showMatchModeEditor"
      :model-value="ruleData?.value"
      :disabled="disabledVal"
      :sub-fields="(unwrap(r.subpropertiesFields) ?? []) as unknown[]"
      @update:model-value="(v) => r.onChangeValue(v)"
    >
      <SubQueryHeader :disabled="disabledVal" :parent-disabled="disabledVal" />
      <component
        v-if="showCloneButtons"
        :is="controls.actionElement"
        :test-id="TestID.cloneRule"
        :label="cloneRuleLabel"
        :title="cloneRuleTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.cloneRule"
        :handle-on-click="cloneRuleFn"
      />
      <component
        v-if="showLockButtons"
        :is="controls.actionElement"
        :test-id="TestID.lockRule"
        :label="lockRuleLabel"
        :title="lockRuleTitle"
        :rule-or-group="ruleData"
        :disabled="parentDisabledVal"
        :class-name="classNamesVal.lockRule"
        :handle-on-click="toggleLockRule"
      />
      <component
        v-if="showMuteButtons"
        :is="controls.actionElement"
        :test-id="TestID.muteRule"
        :label="muteRuleLabel"
        :title="muteRuleTitle"
        :rule-or-group="ruleData"
        :disabled="disabledVal"
        :class-name="classNamesVal.muteRule"
        :handle-on-click="toggleMuteRuleFn"
      />
      <component
        :is="controls.actionElement"
        :test-id="TestID.removeRule"
        :label="removeRuleLabel"
        :title="removeRuleTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.removeRule"
        :handle-on-click="removeRuleFn"
      />
      <SubQueryBody :disabled="disabledVal" :parent-disabled="disabledVal" />
    </SubQueryWrapper>
    <template v-if="!showMatchModeEditor">
      <!-- 与 React 版本一致：当 autoSelectField 为 false 且 field 是 placeholder 时，不显示 operator selector -->
      <component
        v-if="schemaVal?.autoSelectField || ruleData?.field !== fieldsPlaceholderName"
        :is="controls.operatorSelector"
        :value="ruleData?.operator"
        :options="operatorsVal"
        :test-id="TestID.operators"
        title="Operator"
        :disabled="disabledVal"
        :class-name="classNamesVal.operators"
        :handle-on-change="onOperatorChange"
      />
      <component
        v-if="showValueSourceSelector"
        :is="controls.valueSourceSelector"
        :value="ruleData?.valueSource ?? 'value'"
        :options="valueSourceOptionsVal"
        :test-id="TestID.valueSourceSelector"
        :title="valueSourceSelectorTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.valueSource"
        :handle-on-change="onValueSourceChange"
      />
      <component
        v-if="showValueControls"
        :is="controls.valueEditor"
        :value="ruleData?.value"
        :type="valueEditorTypeVal"
        :input-type="inputTypeVal"
        :operator="(ruleData?.operator ?? '') as string"
        :separator="valueEditorSeparatorVal"
        :disabled="disabledVal"
        :class-name="classNamesVal.value"
        :value-list-item-class-name="classNamesVal.valueListItem"
        :values="valuesVal"
        :multiple="valueEditorTypeVal === 'multiselect'"
        :test-id="TestID.valueEditor"
        :parse-numbers="!!schemaVal?.parseNumbers"
        :lists-as-arrays="!!schemaVal?.listsAsArrays"
        :field-data="fieldDataVal"
        :handle-on-change="(v: unknown) => r.onChangeValue(v)"
      />
    </template>
    <template v-if="!showMatchModeEditor">
      <component
        v-if="showCloneButtons"
        :is="controls.actionElement"
        :test-id="TestID.cloneRule"
        :label="cloneRuleLabel"
        :title="cloneRuleTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.cloneRule"
        :handle-on-click="cloneRuleFn"
      />
      <component
        v-if="showLockButtons"
        :is="controls.actionElement"
        :test-id="TestID.lockRule"
        :label="lockRuleLabel"
        :title="lockRuleTitle"
        :rule-or-group="ruleData"
        :disabled="parentDisabledVal"
        :class-name="classNamesVal.lockRule"
        :handle-on-click="toggleLockRule"
      />
      <component
        v-if="showMuteButtons"
        :is="controls.actionElement"
        :test-id="TestID.muteRule"
        :label="muteRuleLabel"
        :title="muteRuleTitle"
        :rule-or-group="ruleData"
        :disabled="disabledVal"
        :class-name="classNamesVal.muteRule"
        :handle-on-click="toggleMuteRuleFn"
      />
      <component
        :is="controls.actionElement"
        :test-id="TestID.removeRule"
        :label="removeRuleLabel"
        :title="removeRuleTitle"
        :disabled="disabledVal"
        :class-name="classNamesVal.removeRule"
        :handle-on-click="removeRuleFn"
      />
    </template>
  </div>
</template>
