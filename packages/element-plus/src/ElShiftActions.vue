<script setup lang="ts">
import { ElButton, ElButtonGroup } from 'element-plus';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';

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
  <ElButtonGroup v-if="shiftUp || shiftDown" direction="vertical" :class="className" :data-testid="testId">
    <ElButton
      v-if="shiftUp"
      :icon="CaretTop"
      :title="titles?.shiftUp"
      :disabled="disabled || shiftUpDisabled"
      @click="shiftUp"
    >
    </ElButton>
    <ElButton
      v-if="shiftDown"
      :icon="CaretBottom"
      :title="titles?.shiftDown"
      :disabled="disabled || shiftDownDisabled"
      @click="shiftDown"
    >
    </ElButton>
  </ElButtonGroup>
</template>
