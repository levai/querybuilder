<script setup lang="ts">
import ActionElement from './ActionElement.vue';

const props = defineProps<{
  path: number[];
  disabled?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  /** 与 React 对齐：shiftUp/shiftDown；兼容 up/down */
  labels?: { shiftUp?: string; shiftDown?: string; up?: string; down?: string };
  titles?: { shiftUp?: string; shiftDown?: string; up?: string; down?: string };
  testID?: string;
}>();

defineEmits<{
  (e: 'shiftUp'): void;
  (e: 'shiftDown'): void;
}>();

const shiftUpLabel = () => props.labels?.shiftUp ?? props.labels?.up ?? '↑';
const shiftDownLabel = () => props.labels?.shiftDown ?? props.labels?.down ?? '↓';
const shiftUpTitle = () => props.titles?.shiftUp ?? props.titles?.up ?? 'Move up';
const shiftDownTitle = () => props.titles?.shiftDown ?? props.titles?.down ?? 'Move down';
</script>

<template>
  <ActionElement
    :label="shiftUpLabel()"
    :title="shiftUpTitle()"
    :disabled="disabled || shiftUpDisabled"
    :testID="testID ? `${testID}-shiftUp` : undefined"
    @click="$emit('shiftUp')"
  />
  <ActionElement
    :label="shiftDownLabel()"
    :title="shiftDownTitle()"
    :disabled="disabled || shiftDownDisabled"
    :testID="testID ? `${testID}-shiftDown` : undefined"
    @click="$emit('shiftDown')"
  />
</template>
