<script setup lang="ts">
import type { FullOption } from '@react-querybuilder/core';

const props = defineProps<{
  modelValue: string | string[];
  options: FullOption[];
  multiple?: boolean;
  listsAsArrays?: boolean;
  title?: string;
  disabled?: boolean;
  className?: string;
  testID?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[]): void;
}>();

function handleChange(event: Event) {
  const el = event.target as HTMLSelectElement;
  if (props.multiple) {
    const selected = Array.from(el.selectedOptions).map(opt => opt.value);
    emit('update:modelValue', props.listsAsArrays ? selected : selected.join(','));
  } else {
    emit('update:modelValue', el.value);
  }
}
</script>

<template>
  <select
    :value="multiple ? undefined : (typeof modelValue === 'string' ? modelValue : modelValue?.[0])"
    :multiple="multiple"
    :title="title"
    :disabled="disabled"
    :class="className"
    :data-testid="testID"
    @change="handleChange"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :selected="Array.isArray(modelValue) && modelValue.includes(option.value)"
    >
      {{ option.label }}
    </option>
  </select>
</template>
