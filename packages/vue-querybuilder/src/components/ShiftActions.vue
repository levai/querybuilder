<script setup lang="ts">
import type { ShiftActionsProps } from '../types';

const props = defineProps<ShiftActionsProps>();
</script>

<template>
  <div :data-testid="props.testID" :class="props.className">
    <button
      :disabled="props.disabled || props.shiftUpDisabled"
      :title="props.titles?.shiftUp"
      @click="props.shiftUp"
    >
      {{ props.labels?.shiftUp }}
    </button>
    <button
      :disabled="props.disabled || props.shiftDownDisabled"
      :title="props.titles?.shiftDown"
      @click="props.shiftDown"
    >
      {{ props.labels?.shiftDown }}
    </button>
  </div>
</template>
