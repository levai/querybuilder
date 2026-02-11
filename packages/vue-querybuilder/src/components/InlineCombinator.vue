<script setup lang="ts">
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
</script>

<template>
  <div :class="props.betweenRulesClassName" :data-testid="props.testId ?? TestID.inlineCombinator">
    <select
      :value="props.value"
      :title="props.title"
      :class="props.className"
      :disabled="props.disabled"
      :data-testid="TestID.combinators"
      @change="(e: Event) => props.handleOnChange?.((e.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in props.options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
    </select>
  </div>
</template>
