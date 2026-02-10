<script setup lang="ts">
import type { Path, FullField } from '@react-querybuilder/core';
import { lc } from '@react-querybuilder/core';
import { useMatchModeEditor } from '../composables/useMatchModeEditor';
import type { MatchModeEditorProps } from '../types';

const props = defineProps<MatchModeEditorProps>();

const {
  selectorComponent: SelectorComponent = props.schema.controls.valueSelector,
  numericEditorComponent: NumericEditorComponent = props.schema.controls.valueEditor,
} = props;

const { thresholdNum, thresholdRule, thresholdSchema, handleChangeMode, handleChangeThreshold } =
  useMatchModeEditor(props);

const dummyPath: Path = [];
const dummyFieldData: FullField = { name: '', value: '', label: '' };

const requiresThreshold = (mm?: string | null): boolean =>
  ['atleast', 'atmost', 'exactly'].includes(lc(mm) ?? '');
</script>

<template>
  <component
    :is="SelectorComponent"
    :schema="props.schema"
    :test-id="props.testID"
    :class="props.className"
    :title="props.title"
    :handle-on-change="handleChangeMode"
    :disabled="props.disabled"
    :value="props.match.mode"
    :options="props.options"
    :multiple="false"
    :lists-as-arrays="false"
    :path="dummyPath"
    :level="0"
  />
  <component
    v-if="requiresThreshold(props.match.mode) && NumericEditorComponent"
    :is="NumericEditorComponent"
    skip-hook
    :test-id="props.testID"
    input-type="number"
    :title="props.title"
    :class="props.className"
    :disabled="props.disabled"
    :handle-on-change="handleChangeThreshold"
    field=""
    operator=""
    :value="thresholdNum"
    value-source="value"
    :field-data="dummyFieldData"
    :schema="thresholdSchema"
    :path="dummyPath"
    :level="0"
    :rule="thresholdRule"
  />
</template>
