<script setup lang="ts">
const props = defineProps<{
  checked?: boolean;
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
  handleOnChange?: (checked: boolean) => void;
  testId?: string;
}>();

function onChange(e: Event) {
  const target = e?.target as HTMLInputElement | undefined;
  props.handleOnChange?.(!!target?.checked);
}
</script>

<template>
  <label :class="className" :title="title" :data-testid="testId">
    <input
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      @change="onChange"
    />
    {{ label }}
  </label>
</template>
