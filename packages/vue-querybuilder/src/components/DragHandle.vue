<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  testId?: string;
}>();
</script>

<template>
  <span :class="className" :title="title" :aria-disabled="disabled" :data-testid="testId">
    {{ label ?? '⋮⋮' }}
  </span>
</template>
