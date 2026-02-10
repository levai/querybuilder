<script setup lang="ts" generic="F extends FullField = FullField">
import type { FullField } from '@react-querybuilder/core';
import { generateId } from '../utils';
import { useValueEditor } from '../composables/useValueEditor';
import type { ValueEditorProps, Schema } from '../types';

const props = defineProps<ValueEditorProps<F>>();

const {
  operator,
  value,
  handleOnChange,
  title,
  className,
  type = 'text',
  inputType,
  values = [],
  listsAsArrays,
  fieldData,
  disabled,
  separator = null,
  testID,
  selectorComponent: SelectorComponent = props.schema.controls.valueSelector,
  parseNumbers: _parseNumbers,
  skipHook: _skipHook,
  valueSource: _valueSource,
} = props;

const {
  valueAsArray,
  multiValueHandler,
  bigIntValueHandler,
  parseNumberMethod,
  valueListItemClassName,
  inputTypeCoerced,
} = useValueEditor(props);

const placeHolderText = fieldData?.placeholder ?? '';

// Radio button component
const RadioButton = (props: {
  name: string;
  disabled?: boolean;
  checked: boolean;
  handleOnChange: (v: unknown) => void;
  label: string;
}) => {
  const id = generateId();
  return { id, ...props };
};

if (operator === 'null' || operator === 'notNull') {
  // Return null for null/notNull operators
}
</script>

<template>
  <!-- Between/NotBetween operators with text or select type -->
  <template
    v-if="
      (operator === 'between' || operator === 'notBetween') &&
      (type === 'select' || type === 'text') &&
      operator !== 'null' &&
      operator !== 'notNull'
    "
  >
    <span :data-testid="testID" :class="className" :title="title">
      <input
        v-if="type === 'text'"
        :type="inputTypeCoerced"
        :placeholder="placeHolderText"
        :value="valueAsArray[0] ?? ''"
        :class="valueListItemClassName"
        :disabled="disabled"
        @change="(e) => multiValueHandler((e.target as HTMLInputElement).value, 0)"
      />
      <component
        v-else
        :is="SelectorComponent"
        :schema="(props.schema as Schema<FullField, string>)"
        :class="valueListItemClassName"
        :handle-on-change="(v) => multiValueHandler(v, 0)"
        :disabled="disabled"
        :value="valueAsArray[0] ?? getFirstOption(values)"
        :options="values"
        :lists-as-arrays="listsAsArrays"
        :path="props.path"
        :level="props.level"
      />
      {{ separator }}
      <input
        v-if="type === 'text'"
        :type="inputTypeCoerced"
        :placeholder="placeHolderText"
        :value="valueAsArray[1] ?? ''"
        :class="valueListItemClassName"
        :disabled="disabled"
        @change="(e) => multiValueHandler((e.target as HTMLInputElement).value, 1)"
      />
      <component
        v-else
        :is="SelectorComponent"
        :schema="(props.schema as Schema<FullField, string>)"
        :class="valueListItemClassName"
        :handle-on-change="(v) => multiValueHandler(v, 1)"
        :disabled="disabled"
        :value="valueAsArray[1] ?? getFirstOption(values)"
        :options="values"
        :lists-as-arrays="listsAsArrays"
        :path="props.path"
        :level="props.level"
      />
    </span>
  </template>

  <!-- Select/Multiselect type -->
  <component
    v-else-if="(type === 'select' || type === 'multiselect') && operator !== 'null' && operator !== 'notNull'"
    :is="SelectorComponent"
    :schema="(props.schema as Schema<FullField, string>)"
    :test-id="testID"
    :class="className"
    :title="title"
    :handle-on-change="handleOnChange"
    :disabled="disabled"
    :value="value"
    :options="values"
    :multiple="type === 'multiselect'"
    :lists-as-arrays="listsAsArrays"
    :path="props.path"
    :level="props.level"
  />

  <!-- Textarea type -->
  <textarea
    v-else-if="type === 'textarea' && operator !== 'null' && operator !== 'notNull'"
    :data-testid="testID"
    :placeholder="placeHolderText"
    :value="value"
    :title="title"
    :class="className"
    :disabled="disabled"
    @change="(e) => handleOnChange((e.target as HTMLTextAreaElement).value)"
  />

  <!-- Switch/Checkbox type -->
  <input
    v-else-if="(type === 'switch' || type === 'checkbox') && operator !== 'null' && operator !== 'notNull'"
    :data-testid="testID"
    type="checkbox"
    :class="className"
    :title="title"
    :checked="!!value"
    :disabled="disabled"
    @change="(e) => handleOnChange((e.target as HTMLInputElement).checked)"
  />

  <!-- Radio type -->
  <span
    v-else-if="type === 'radio' && operator !== 'null' && operator !== 'notNull'"
    :data-testid="testID"
    :class="className"
    :title="title"
  >
    <label
      v-for="v in values"
      :key="v.name"
      :for="`radio-${v.name}-${testID}`"
    >
      <input
        :id="`radio-${v.name}-${testID}`"
        type="radio"
        :name="`radio-${testID}`"
        :value="v.name"
        :disabled="disabled"
        :checked="value === v.name"
        @change="handleOnChange(v.name)"
      />
      {{ v.label }}
    </label>
  </span>

  <!-- Bigint input type -->
  <input
    v-else-if="inputType === 'bigint' && operator !== 'null' && operator !== 'notNull'"
    :data-testid="testID"
    :type="inputTypeCoerced"
    :placeholder="placeHolderText"
    :value="`${value}`"
    :title="title"
    :class="className"
    :disabled="disabled"
    @change="(e) => bigIntValueHandler((e.target as HTMLInputElement).value)"
  />

  <!-- Default text input -->
  <input
    v-else-if="operator !== 'null' && operator !== 'notNull'"
    :data-testid="testID"
    :type="inputTypeCoerced"
    :placeholder="placeHolderText"
    :value="value"
    :title="title"
    :class="className"
    :disabled="disabled"
    @change="(e) =>
      handleOnChange(
        parseNumber((e.target as HTMLInputElement).value, {
          parseNumbers: parseNumberMethod,
        })
      )"
  />
</template>

<script lang="ts">
import { getFirstOption, parseNumber } from '@react-querybuilder/core';
</script>
