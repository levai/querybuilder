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

// 使用 computed 实现 v-model 的双向绑定
const modelValue = computed({
  get() {
    const v = props.value;
    if (v && typeof v === 'object' && 'mode' in v) return (v as { mode: string }).mode;
    return v ?? '';
  },
  set(newValue: string) {
    props.handleOnChange?.(newValue);
  },
});
</script>

<template>
  <select
    v-model="modelValue"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
  >
    <option v-for="opt in options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
  </select>
</template>
