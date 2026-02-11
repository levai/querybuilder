<script setup lang="ts">
import { computed } from 'vue';

type FlatOpt = { value?: string; name?: string; label: string; disabled?: boolean };
type OptGroup = { type: 'optgroup'; label: string; options?: Array<{ value?: string; name?: string; label: string; disabled?: boolean }> };
type OptionItem = FlatOpt | OptGroup | { type: 'option'; value?: string; label: string; disabled?: boolean };

const props = defineProps<{
  value?: string | string[] | null;
  /** toOptions() 返回格式或 { name, label }[] */
  options?: OptionItem[] | null;
  title?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  handleOnChange?: (value: string | string[]) => void;
  testId?: string;
}>();

// 使用 computed 实现 v-model 的双向绑定
const modelValue = computed({
  get() {
    if (props.multiple) {
      // multiselect 模式下返回数组
      return Array.isArray(props.value) ? props.value : props.value != null ? [props.value] : [];
    }
    // 单选模式下返回字符串
    return Array.isArray(props.value) ? props.value[0] : props.value ?? '';
  },
  set(newValue: string | string[]) {
    if (props.multiple) {
      // multiselect 模式下，newValue 应该是数组
      const valueArray = Array.isArray(newValue) ? newValue : [newValue];
      props.handleOnChange?.(valueArray);
    } else {
      // 单选模式下，newValue 应该是字符串
      props.handleOnChange?.(Array.isArray(newValue) ? newValue[0] : newValue);
    }
  },
});

function optValue(o: { value?: string; name?: string }): string {
  return o?.value ?? o?.name ?? '';
}
</script>

<template>
  <select
    v-model="modelValue"
    :title="title"
    :class="className"
    :disabled="disabled"
    :multiple="multiple"
    :data-testid="testId"
  >
    <template v-for="(opt, i) in (options ?? [])" :key="i">
      <optgroup v-if="opt && typeof opt === 'object' && 'options' in opt" :label="(opt as OptGroup).label">
        <option
          v-for="o in ((opt as OptGroup).options ?? [])"
          :key="optValue(o)"
          :value="optValue(o)"
          :disabled="o.disabled"
        >
          {{ o.label }}
        </option>
      </optgroup>
      <option
        v-else-if="opt && typeof opt === 'object' && ('name' in opt || 'value' in opt)"
        :value="optValue(opt as FlatOpt)"
        :disabled="(opt as FlatOpt).disabled"
      >
        {{ (opt as FlatOpt).label }}
      </option>
    </template>
  </select>
</template>
