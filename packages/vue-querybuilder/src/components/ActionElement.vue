<script setup lang="ts">
defineOptions({ inheritAttrs: false });
withDefaults(
  defineProps<{
    label?: string;
    title?: string;
    className?: string;
    disabled?: boolean;
    handleOnClick?: (e?: MouseEvent) => void;
    ruleOrGroup?: unknown;
    testId?: string;
  }>(),
  { disabled: false }
);
</script>

<template>
  <button
    type="button"
    :class="className"
    :title="title"
    :disabled="disabled"
    :data-testid="testId"
    @click="handleOnClick"
  >
    {{ label }}
  </button>
</template>
