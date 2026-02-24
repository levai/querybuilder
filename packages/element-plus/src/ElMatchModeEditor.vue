<script setup lang="ts">
import { computed } from 'vue';
import { ElSelect, ElOption } from 'element-plus';

const props = defineProps<{
  value?: unknown;
  options?: Array<{ name: string; label: string }>;
  className?: string;
  disabled?: boolean;
  handleOnChange?: (value: unknown) => void;
  testId?: string;
}>();

const modelValue = computed({
  get() {
    const v = props.value;
    if (v && typeof v === 'object' && 'mode' in v) return (v as { mode: string }).mode;
    return v ?? '';
  },
  set(newValue: string) {
    props.handleOnChange?.(newValue);
  },
});
</script>

<template>
  <ElSelect
    v-model="modelValue"
    :class="className"
    :disabled="disabled"
   
    :data-testid="testId"
    @change="(v: string) => handleOnChange?.(v)"
  >
    <ElOption
      v-for="opt in options"
      :key="opt.name"
      :value="opt.name"
      :label="opt.label"
    />
  </ElSelect>
</template>
