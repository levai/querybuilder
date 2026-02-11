<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <span :class="className" :title="title" :aria-disabled="disabled">
    {{ label ?? '⋮⋮' }}
  </span>
</template>
