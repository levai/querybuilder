<script setup lang="ts">
import type { FullOption } from '@react-querybuilder/core';
import ValueSelector from './ValueSelector.vue';

defineProps<{
  modelValue: string;
  options: FullOption[];
  title?: string;
  disabled?: boolean;
  className?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

function onUpdate(v: string | string[]) {
  emit('update:modelValue', Array.isArray(v) ? (v[0] ?? '') : v);
}
</script>

<template>
  <ValueSelector
    :model-value="modelValue"
    :options="options"
    :title="title"
    :disabled="disabled"
    :class="className"
    @update:model-value="onUpdate"
  />
</template>
