<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label?: string;
  title?: string;
  disabled?: boolean;
  testID?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

<template>
  <label :title="title">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :data-testid="props.testID"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span v-if="label">{{ label }}</span>
  </label>
</template>
