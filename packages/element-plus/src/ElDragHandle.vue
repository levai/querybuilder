<script setup lang="ts">
import { ElIcon } from 'element-plus';
import { Rank } from '@element-plus/icons-vue';

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
    <ElIcon><Rank /></ElIcon>
  </span>
</template>
