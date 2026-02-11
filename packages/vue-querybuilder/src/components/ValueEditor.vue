<script setup lang="ts">
import { computed } from 'vue';
import { toOptions } from '../utils';
import ValueSelector from './ValueSelector.vue';

const props = withDefaults(
  defineProps<{
    value?: unknown;
    type?: string;
    inputType?: string | null;
    disabled?: boolean;
    className?: string;
    title?: string;
    placeholder?: string;
    handleOnChange?: (value: unknown) => void;
    values?: Array<{ name: string; label: string }> | Array<{ type: 'optgroup'; label: string; options: Array<{ name: string; label: string }> }>;
    multiple?: boolean;
  }>(),
  { type: 'text', multiple: false }
);

const optionsForSelect = computed(() => toOptions(props.values as import('@react-querybuilder/core').OptionList) ?? []);

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

function onInputChange(e: Event) {
  const t = (e?.target as HTMLInputElement);
  if (props.type === 'checkbox') props.handleOnChange?.(!!t?.checked);
  else props.handleOnChange?.(t?.value ?? '');
}

function onSelectChange(v: string | string[]) {
  props.handleOnChange?.(props.multiple ? v : (Array.isArray(v) ? v[0] : v));
}
</script>

<template>
  <!-- select / multiselect: 用 ValueSelector 渲染下拉 -->
  <ValueSelector
    v-if="type === 'select' || type === 'multiselect'"
    :value="valueForSelector"
    :options="optionsForSelect"
    :title="title"
    :class-name="className"
    :disabled="disabled"
    :multiple="type === 'multiselect'"
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
    @input="onInputChange"
  />
</template>
