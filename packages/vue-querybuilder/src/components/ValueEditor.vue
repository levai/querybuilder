<script setup lang="ts">
import { computed } from 'vue';
import { toArray, joinWith } from '@react-querybuilder/core';
import { toOptions } from '../utils';
import ValueSelector from './ValueSelector.vue';

const props = withDefaults(
  defineProps<{
    value?: unknown;
    type?: string;
    inputType?: string | null;
    operator?: string;
    disabled?: boolean;
    className?: string;
    title?: string;
    placeholder?: string;
    handleOnChange?: (value: unknown) => void;
    values?: Array<{ name: string; label: string }> | Array<{ type: 'optgroup'; label: string; options: Array<{ name: string; label: string }> }>;
    multiple?: boolean;
    testId?: string;
    parseNumbers?: boolean;
    listsAsArrays?: boolean;
    separator?: string | null;
  }>(),
  { type: 'text', multiple: false, parseNumbers: false, listsAsArrays: false, operator: '', separator: null }
);

const optionsForSelect = computed(() => toOptions(props.values as import('@react-querybuilder/core').OptionList) ?? []);

const optionsFlatForRadio = computed(() =>
  optionsForSelect.value.flatMap((o: { type?: string; value?: string; label?: string; options?: Array<{ value?: string; label?: string }> }) =>
    o.type === 'optgroup' ? (o.options ?? []) : [{ value: o.value, label: o.label }]
  )
);

const valueAsArray = computed(() => toArray(props.value, { retainEmptyStrings: true }));

const valueForSelector = computed((): string | string[] | null => {
  const v = props.value;
  if (v == null) return null;
  if (Array.isArray(v)) return v as string[];
  return String(v);
});

const displayValue = computed(() => {
  const v = props.value;
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v[0] ?? '';
  return String(v);
});

const isBetween = computed(() => {
  const op = (props.operator ?? '').toString().toLowerCase();
  return op === 'between' || op === 'notbetween';
});

const showBetweenInputs = computed(() => isBetween.value && (props.type === 'text' || props.type === 'select'));

const firstOptionName = computed(() => {
  const opts = props.values;
  if (Array.isArray(opts) && opts[0] && typeof opts[0] === 'object' && 'name' in opts[0]) return (opts[0] as { name: string }).name;
  return '';
});

function multiValueHandler(val: unknown, idx: number) {
  const arr = [...valueAsArray.value];
  const needsBetweenFix = idx === 0 && arr.length < 2;
  if (arr[idx] === val && !needsBetweenFix) {
    props.handleOnChange?.(props.listsAsArrays ? arr : joinWith(arr, ','));
    return;
  }
  arr[idx] = val;
  if (needsBetweenFix) arr[1] = firstOptionName.value;
  props.handleOnChange?.(props.listsAsArrays ? arr : joinWith(arr, ','));
}

function onInputChange(e: Event) {
  const t = (e?.target as HTMLInputElement);
  if (props.type === 'checkbox') {
    props.handleOnChange?.(!!t?.checked);
    return;
  }
  const raw = t?.value ?? '';
  if (props.parseNumbers && (props.inputType === 'number' || props.inputType === 'range')) {
    const n = Number(raw);
    const out = raw === '' ? null : (Number.isNaN(n) ? raw : n);
    props.handleOnChange?.(out);
  } else {
    props.handleOnChange?.(raw);
  }
}

function onSelectChange(v: string | string[]) {
  props.handleOnChange?.(props.multiple ? v : (Array.isArray(v) ? v[0] : v));
}
</script>

<template>
  <!-- between/notBetween: 双输入 -->
  <span
    v-if="showBetweenInputs"
    :class="className"
    :title="title"
    :data-testid="testId"
  >
    <template v-if="type === 'text'">
      <input
        :type="inputType ?? 'text'"
        :placeholder="placeholder"
        :value="valueAsArray[0] ?? ''"
        :disabled="disabled"
        @input="(e: Event) => multiValueHandler((e.target as HTMLInputElement)?.value, 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <input
        :type="inputType ?? 'text'"
        :placeholder="placeholder"
        :value="valueAsArray[1] ?? ''"
        :disabled="disabled"
        @input="(e: Event) => multiValueHandler((e.target as HTMLInputElement)?.value, 1)"
      />
    </template>
    <template v-else>
      <ValueSelector
        :value="valueAsArray[0] ?? firstOptionName"
        :options="optionsForSelect"
        :disabled="disabled"
        :handle-on-change="(v: string | string[]) => multiValueHandler(Array.isArray(v) ? v[0] : v, 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ValueSelector
        :value="valueAsArray[1] ?? firstOptionName"
        :options="optionsForSelect"
        :disabled="disabled"
        :handle-on-change="(v: string | string[]) => multiValueHandler(Array.isArray(v) ? v[0] : v, 1)"
      />
    </template>
  </span>
  <!-- radio -->
  <span
    v-else-if="type === 'radio'"
    :class="className"
    :title="title"
    :data-testid="testId"
  >
    <label
      v-for="opt in optionsFlatForRadio"
      :key="opt?.value"
      class="value-list-item"
    >
      <input
        type="radio"
        :name="`ve-${testId ?? 'radio'}`"
        :value="opt?.value"
        :disabled="disabled"
        :checked="value === opt?.value"
        @change="handleOnChange?.(opt?.value)"
      />
      {{ opt?.label }}
    </label>
  </span>
  <!-- select / multiselect: 用 ValueSelector 渲染下拉 -->
  <ValueSelector
    v-else-if="type === 'select' || type === 'multiselect'"
    :value="valueForSelector"
    :options="optionsForSelect"
    :title="title"
    :class-name="className"
    :disabled="disabled"
    :multiple="type === 'multiselect'"
    :test-id="testId"
    :handle-on-change="onSelectChange"
  />
  <!-- checkbox / switch -->
  <input
    v-else-if="type === 'checkbox' || type === 'switch'"
    type="checkbox"
    :class="className"
    :title="title"
    :checked="!!value"
    :disabled="disabled"
    :data-testid="testId"
    @change="onInputChange"
  />
  <!-- textarea -->
  <textarea
    v-else-if="type === 'textarea'"
    :placeholder="placeholder"
    :value="displayValue"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @input="(e: Event) => handleOnChange?.((e.target as HTMLTextAreaElement)?.value)"
  />
  <!-- 默认 text 输入 -->
  <input
    v-else
    :type="inputType ?? 'text'"
    :placeholder="placeholder"
    :value="displayValue"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @input="onInputChange"
  />
</template>
