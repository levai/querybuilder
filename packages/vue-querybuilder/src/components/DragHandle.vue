<script setup lang="ts">
import type { DragHandleProps } from '../types';

const props = defineProps<DragHandleProps>();

// Vue 3 template refs are handled via template ref attribute
// For drag handle, we'll expose the ref via defineExpose if needed
defineExpose({
  // The parent component can access this via template ref
});
</script>

<template>
  <span
    :data-testid="props.testID"
    :class="props.className"
    :title="props.title"
  >
    {{ props.label }}
  </span>
</template>
