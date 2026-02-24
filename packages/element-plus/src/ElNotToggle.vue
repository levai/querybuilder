<script setup lang="ts">
import { ElSwitch } from 'element-plus';

defineProps<{
  checked?: boolean;
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  handleOnChange?: (checked: boolean) => void;
  testId?: string;
}>();
</script>

<template>
  <ElSwitch
    :model-value="checked"
    :class="className"
    :title="title"
    :disabled="disabled"
    :data-testid="testId"
    :active-text="label"
    inactive-text=""
    @update:model-value="handleOnChange?.(!!$event)"
  />
</template>
