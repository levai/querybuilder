<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value?: unknown;
  options?: Array<{ name: string; label: string }>;
  className?: string;
  disabled?: boolean;
  handleOnChange?: (value: unknown) => void;
  testId?: string;
}>();

const selectValue = computed(() => {
  const v = props.value;
  if (v && typeof v === 'object' && 'mode' in v) return (v as { mode: string }).mode;
  return v;
});

function onSelectChange(e: Event) {
  const t = (e?.target as HTMLSelectElement);
  props.handleOnChange?.(t?.value);
}
</script>

<template>
  <select
    :value="selectValue"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @change="onSelectChange"
  >
    <option v-for="opt in options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
  </select>
</template>
