<script setup lang="ts">
defineProps<{
  label?: string;
  title?: string;
  disabled?: boolean;
  /** 与 React 对齐；同时保留 actionClass 以兼容现有用法 */
  className?: string;
  actionClass?: string;
  testID?: string;
}>();

const emit = defineEmits<{
  (e: 'click', event?: MouseEvent, context?: unknown): void;
}>();
</script>

<template>
  <button
    :class="[className, actionClass]"
    :title="title"
    :disabled="disabled"
    :data-testid="testID"
    type="button"
    @click="emit('click', $event)"
  >
    {{ label }}
  </button>
</template>
