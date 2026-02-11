<script setup lang="ts">
defineProps<{
  options?: Array<{ name: string; label: string }>;
  value?: string;
  title?: string;
  className?: string;
  handleOnChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}>();
</script>

<template>
  <select
    :value="value"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @change="(e: Event) => handleOnChange?.((e.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
  </select>
</template>
