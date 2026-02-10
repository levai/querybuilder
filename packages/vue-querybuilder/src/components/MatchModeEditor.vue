<script setup lang="ts">
import { computed } from 'vue';
import { lc, parseNumber } from '@react-querybuilder/core';
import type { MatchMode, MatchModeOptions } from '@react-querybuilder/core';
import ValueSelector from './ValueSelector.vue';
import ValueEditor from './ValueEditor.vue';

const props = defineProps<{
  match: { mode: MatchMode; threshold?: number };
  options: MatchModeOptions;
  title?: string;
  className?: string;
  disabled?: boolean;
  testID?: string;
}>();

const emit = defineEmits<{
  (e: 'update:match', match: { mode: MatchMode; threshold?: number }): void;
}>();

const requiresThreshold = (mm?: string | null) =>
  ['atleast', 'atmost', 'exactly'].includes(lc(mm) ?? '');

const thresholdNum = computed(() =>
  typeof props.match.threshold === 'number' ? Math.max(0, props.match.threshold) : 1
);

const handleChangeMode = (value: string | string[]) => {
  const mode = (Array.isArray(value) ? value[0] : value) as MatchMode;
  if (requiresThreshold(mode) && typeof props.match.threshold !== 'number') {
    emit('update:match', { ...props.match, mode, threshold: 1 });
  } else {
    emit('update:match', { ...props.match, mode });
  }
};

const handleChangeThreshold = (value: string | number | boolean | (string | null)[]) => {
  const threshold = typeof value === 'number' ? value : parseNumber(value as string, { parseNumbers: true });
  emit('update:match', { ...props.match, threshold });
};
</script>

<template>
  <div :class="className">
    <ValueSelector
      :model-value="match.mode"
      :options="options"
      :title="title"
      :disabled="disabled"
      :testID="testID"
      @update:model-value="handleChangeMode"
    />
    <ValueEditor
      v-if="requiresThreshold(match.mode)"
      :model-value="thresholdNum"
      value-editor-type="text"
      input-type="number"
      :disabled="disabled"
      :testID="testID"
      @update:model-value="handleChangeThreshold"
    />
  </div>
</template>
