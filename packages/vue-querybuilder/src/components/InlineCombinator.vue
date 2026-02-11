<script setup lang="ts">
import { computed } from 'vue';
import { TestID } from '@react-querybuilder/core';

const props = defineProps<{
  options?: Array<{ name: string; label: string }>;
  value?: string;
  title?: string;
  className?: string;
  betweenRulesClassName?: string;
  handleOnChange?: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}>();

// 使用 computed 实现 v-model 的双向绑定
const modelValue = computed({
  get() {
    return props.value ?? '';
  },
  set(newValue: string) {
    props.handleOnChange?.(newValue);
  },
});
</script>

<template>
  <div :class="props.betweenRulesClassName" :data-testid="props.testId ?? TestID.inlineCombinator">
    <select
      v-model="modelValue"
      :title="props.title"
      :class="props.className"
      :disabled="props.disabled"
      :data-testid="TestID.combinators"
    >
      <option v-for="opt in props.options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
    </select>
  </div>
</template>
