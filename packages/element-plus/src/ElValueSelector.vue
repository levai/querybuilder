<script setup lang="ts">
import { computed } from 'vue';
import { ElSelect, ElOption } from 'element-plus';
import { getFirstOption } from 'vue-querybuilder';

type FlatOpt = { value?: string; name?: string; label: string; disabled?: boolean };
type OptGroup = { type: 'optgroup'; label: string; options?: Array<{ value?: string; name?: string; label: string; disabled?: boolean }> };
type OptionItem = FlatOpt | OptGroup | { type: 'option'; value?: string; label: string; disabled?: boolean };

const props = defineProps<{
  value?: string | string[] | null;
  options?: OptionItem[] | null;
  title?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  handleOnChange?: (value: string | string[]) => void;
  testId?: string;
}>();

function getFirstOptionValue(): string | undefined {
  const firstOpt = getFirstOption(props.options as never);
  return firstOpt != null ? String(firstOpt) : undefined;
}

const modelValue = computed({
  get() {
    if (props.multiple) {
      return Array.isArray(props.value) ? props.value : props.value != null ? [props.value] : [];
    }
    if (props.value == null || props.value === '') {
      return getFirstOptionValue() ?? '';
    }
    return Array.isArray(props.value) ? props.value[0] : props.value;
  },
  set(newValue: string | string[]) {
    if (props.multiple) {
      const valueArray = Array.isArray(newValue) ? newValue : [newValue];
      props.handleOnChange?.(valueArray);
    } else {
      props.handleOnChange?.(Array.isArray(newValue) ? newValue[0] : newValue);
    }
  },
});

function optValue(o: { value?: string; name?: string }): string {
  return o?.value ?? o?.name ?? '';
}
</script>

<template>
  <ElSelect
    v-model="modelValue"
    :class="className"
    :disabled="disabled"
    :multiple="multiple"
    :placeholder="multiple ? undefined : title"
    :data-testid="testId"
   
  >
    <template v-for="(opt, i) in (options ?? [])" :key="i">
      <ElOption
        v-if="opt && typeof opt === 'object' && 'options' in opt"
        v-for="o in ((opt as OptGroup).options ?? [])"
        :key="optValue(o)"
        :value="optValue(o)"
        :label="(o as FlatOpt).label"
        :disabled="(o as FlatOpt).disabled"
      />
      <ElOption
        v-else-if="opt && typeof opt === 'object' && ('name' in opt || 'value' in opt)"
        :value="optValue(opt as FlatOpt)"
        :label="(opt as FlatOpt).label"
        :disabled="(opt as FlatOpt).disabled"
      />
    </template>
  </ElSelect>
</template>
