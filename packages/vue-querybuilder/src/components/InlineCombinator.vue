<script setup lang="ts">
import type { FullOption } from '@react-querybuilder/core';
import CombinatorSelector from './CombinatorSelector.vue';

defineProps<{
  modelValue: string;
  options: FullOption[];
  title?: string;
  disabled?: boolean;
  className?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <CombinatorSelector
    :model-value="modelValue"
    :options="options"
    :title="title"
    :disabled="disabled"
    :class="className"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
