<script setup lang="ts">
import { inject, computed } from 'vue';
import { TestID } from '@react-querybuilder/core';
import { useRule } from '../composables/useRule';
import { useStopEventPropagation } from '../composables/useStopEventPropagation';
import type { RuleProps, Schema } from '../types';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import ValueSelector from './ValueSelector.vue';
import MatchModeEditor from './MatchModeEditor.vue';
import ValueEditor from './ValueEditor.vue';
import ActionElement from './ActionElement.vue';
import RuleGroup from './RuleGroup.vue';

const props = defineProps<Omit<RuleProps, 'schema'>>();

const schemaRef = inject(QUERY_BUILDER_CONTEXT_KEY);
if (!schemaRef) {
  throw new Error('Rule must be used within QueryBuilder');
}

// Extract schema from context (similar to RuleGroup)
const schema = computed((): Schema => {
  const contextValue = schemaRef.value;
  if (!contextValue?.schema) {
    throw new Error('Schema not found in QueryBuilder context');
  }
  // Check if schema is already a Ref or if Vue unwrapped it
  let schemaValue: any;
  if (contextValue.schema && typeof contextValue.schema === 'object' && 'value' in contextValue.schema) {
    schemaValue = (contextValue.schema as any).value;
  } else {
    schemaValue = contextValue.schema;
  }
  if (!schemaValue) {
    throw new Error('Schema value is undefined');
  }
  return schemaValue as Schema;
});

const r = useRule({
  ...props,
  schema: schema.value,
} as RuleProps);

const cloneRule = useStopEventPropagation(r.cloneRule);
const toggleLockRule = useStopEventPropagation(r.toggleLockRule);
const toggleMuteRule = useStopEventPropagation(r.toggleMuteRule);
const removeRule = useStopEventPropagation(r.removeRule);
const shiftRuleUp = useStopEventPropagation(r.shiftRuleUp);
const shiftRuleDown = useStopEventPropagation(r.shiftRuleDown);

const showFieldSelector = computed(() => {
  const s = schema.value;
  if (!s) return false;
  return !(
    s.fields.length === 1 &&
    typeof s.fields[0] === 'object' &&
    s.fields[0] !== null &&
    'value' in s.fields[0] &&
    s.fields[0].value === ''
  );
});

const shiftTitles = computed(() => {
  const s = schema.value;
  if (!s) return undefined;
  return s.showShiftActions
    ? {
        shiftUp: r.translations.shiftActionUp.title,
        shiftDown: r.translations.shiftActionDown.title,
      }
    : undefined;
});

const shiftLabels = computed(() => {
  const s = schema.value;
  if (!s) return undefined;
  return s.showShiftActions
    ? {
        shiftUp: r.translations.shiftActionUp.label,
        shiftDown: r.translations.shiftActionDown.label,
      }
    : undefined;
});
</script>

<template>
  <div
    :data-testid="TestID.rule"
    :class="r.outerClassName"
    :data-rule-id="r.id"
    :data-level="r.path.length"
    :data-path="JSON.stringify(r.path)"
  >
    <!-- ShiftActions -->
    <ShiftActions
      v-if="schema.showShiftActions"
      :test-id="TestID.shiftActions"
      :class="r.classNames.shiftActions"
      :disabled="r.disabled"
      :shift-up-disabled="props.shiftUpDisabled"
      :shift-down-disabled="props.shiftDownDisabled"
      :titles="shiftTitles"
      :labels="shiftLabels"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
      @shift-up="shiftRuleUp"
      @shift-down="shiftRuleDown"
    />

    <!-- DragHandle -->
    <DragHandle
      v-if="schema.enableDragAndDrop"
      :test-id="TestID.dragHandle"
      :class="r.classNames.dragHandle"
      :title="r.translations.dragHandle.title"
      :label="r.translations.dragHandle.label"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
    />

    <!-- FieldSelector -->
    <ValueSelector
      v-if="showFieldSelector"
      :test-id="TestID.fields"
      :class="r.classNames.fields"
      :title="r.translations.fields.title"
      :value="r.rule.field"
      :options="schema.fields ?? []"
      :disabled="r.disabled"
      :handle-on-change="r.onChangeField"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
    />

    <!-- MatchModeEditor or OperatorSelector + ValueEditor -->
    <template v-if="schema.autoSelectField || r.rule.field !== r.translations.fields.placeholderName">
      <template v-if="r.matchModes.length > 0">
        <!-- SubQuery mode -->
        <MatchModeEditor
          :test-id="TestID.matchModeEditor"
          :class-name="r.classNames.matchMode"
          :title="r.translations.matchMode.title"
          :field="r.rule.field"
          :field-data="r.fieldData"
          :options="r.matchModes"
          :match="r.rule.match ?? { mode: 'all' }"
          :disabled="r.disabled"
          :handle-on-change="r.onChangeMatchMode"
          :path="r.path"
          :level="r.path.length"
          :schema="schema"
          :class-names="{ matchMode: r.classNames.matchMode, matchThreshold: r.classNames.matchThreshold }"
          :rule="r.rule"
        />
        <!-- SubQuery RuleGroup would be rendered here if needed -->
      </template>
      <template v-else>
        <!-- Normal rule mode -->
        <!-- OperatorSelector -->
        <ValueSelector
          :test-id="TestID.operators"
          :class="r.classNames.operators"
          :title="r.translations.operators.title"
          :value="r.rule.operator"
          :options="r.operators"
          :disabled="r.disabled"
          :handle-on-change="r.onChangeOperator"
          :path="r.path"
          :level="r.path.length"
          :schema="schema"
        />

        <!-- ValueSourceSelector + ValueEditor -->
        <template v-if="(schema.autoSelectOperator || r.rule.operator !== r.translations.operators.placeholderName) && !r.hideValueControls">
          <ValueSelector
            v-if="!['null', 'notnull'].includes(String(r.rule.operator).toLowerCase()) && r.valueSources.length > 1"
            :test-id="TestID.valueSourceSelector"
            :class="r.classNames.valueSource"
            :title="r.translations.valueSourceSelector.title"
            :value="r.rule.valueSource ?? 'value'"
            :options="r.valueSourceOptions as any"
            :disabled="r.disabled"
            :handle-on-change="r.onChangeValueSource"
            :path="r.path"
            :level="r.path.length"
            :schema="schema as any"
          />

          <ValueEditor
            :test-id="TestID.valueEditor"
            :class="r.classNames.value"
            :title="r.translations.value.title"
            :field="r.rule.field"
            :operator="r.rule.operator"
            :value="r.rule.value"
            :value-source="r.rule.valueSource ?? 'value'"
            :type="r.valueEditorType"
            :input-type="r.inputType"
            :values="r.values"
            :lists-as-arrays="schema.listsAsArrays"
            :parse-numbers="schema.parseNumbers"
            :separator="r.valueEditorSeparator"
            :field-data="r.fieldData"
            :disabled="r.disabled"
            :handle-on-change="r.onChangeValue"
            :path="r.path"
            :level="r.path.length"
            :schema="schema"
            :rule="r.rule"
          />
        </template>
      </template>
    </template>

    <!-- CloneRuleAction -->
    <ActionElement
      v-if="schema.showCloneButtons"
      :test-id="TestID.cloneRule"
      :class="r.classNames.cloneRule"
      :label="r.translations.cloneRule.label"
      :title="r.translations.cloneRule.title"
      :disabled="r.disabled"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
      :handle-on-click="cloneRule"
    />

    <!-- LockRuleAction -->
    <ActionElement
      v-if="schema.showLockButtons"
      :test-id="TestID.lockRule"
      :class="r.classNames.lockRule"
      :label="r.translations.lockRule.label"
      :title="r.translations.lockRule.title"
      :disabled="r.disabled"
      :disabled-translation="props.parentDisabled ? undefined : r.translations.lockRuleDisabled"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
      :handle-on-click="toggleLockRule"
    />

    <!-- MuteRuleAction -->
    <ActionElement
      v-if="schema.showMuteButtons"
      :test-id="TestID.muteRule"
      :class="r.classNames.muteRule"
      :label="r.rule.muted ? r.translations.unmuteRule.label : r.translations.muteRule.label"
      :title="r.rule.muted ? r.translations.unmuteRule.title : r.translations.muteRule.title"
      :disabled="r.disabled"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
      :handle-on-click="toggleMuteRule"
    />

    <!-- RemoveRuleAction -->
    <ActionElement
      :test-id="TestID.removeRule"
      :class="r.classNames.removeRule"
      :label="r.translations.removeRule.label"
      :title="r.translations.removeRule.title"
      :disabled="r.disabled"
      :rule-or-group="r.rule"
      :path="r.path"
      :level="r.path.length"
      :schema="schema"
      :handle-on-click="removeRule"
    />
  </div>
</template>
