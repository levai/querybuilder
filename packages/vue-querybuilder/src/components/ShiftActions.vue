<script setup lang="ts">
defineProps<{
  shiftUp?: () => void;
  shiftDown?: () => void;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  labels?: { shiftUp?: string; shiftDown?: string };
  titles?: { shiftUp?: string; shiftDown?: string };
  className?: string;
  disabled?: boolean;
  testId?: string;
}>();
</script>

<template>
  <span v-if="shiftUp || shiftDown" :class="className" :data-testid="testId">
    <button
      v-if="shiftUp"
      type="button"
      :title="titles?.shiftUp"
      :disabled="disabled || shiftUpDisabled"
      @click="shiftUp"
    >
      {{ labels?.shiftUp ?? '↑' }}
    </button>
    <button
      v-if="shiftDown"
      type="button"
      :title="titles?.shiftDown"
      :disabled="disabled || shiftDownDisabled"
      @click="shiftDown"
    >
      {{ labels?.shiftDown ?? '↓' }}
    </button>
  </span>
</template>
