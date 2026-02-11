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

const selectValue = computed(() =>
  props.multiple ? (Array.isArray(props.value) ? props.value : props.value != null ? [props.value] : []) : (Array.isArray(props.value) ? props.value[0] : props.value ?? '')
);

function optValue(o: { value?: string; name?: string }): string {
  return o?.value ?? o?.name ?? '';
}

function onChange(e: Event) {
  const t = e?.target as HTMLSelectElement;
  if (props.multiple) {
    const selected = Array.from(t.selectedOptions).map((el) => el.value);
    props.handleOnChange?.(selected);
  } else {
    props.handleOnChange?.(t?.value ?? '');
  }
}
</script>

<template>
  <select
    :value="multiple ? undefined : (Array.isArray(selectValue) ? selectValue[0] : selectValue)"
    :title="title"
    :class="className"
    :disabled="disabled"
    :multiple="multiple"
    :data-testid="testId"
    @change="onChange"
  >
    <template v-for="(opt, i) in (options ?? [])" :key="i">
      <optgroup v-if="opt && typeof opt === 'object' && 'options' in opt" :label="(opt as OptGroup).label">
        <option
          v-for="o in ((opt as OptGroup).options ?? [])"
          :key="optValue(o)"
          :value="optValue(o)"
          :selected="multiple && Array.isArray(selectValue) && selectValue.includes(optValue(o))"
          :disabled="o.disabled"
        >
          {{ o.label }}
        </option>
      </optgroup>
      <option
        v-else-if="opt && typeof opt === 'object' && ('name' in opt || 'value' in opt)"
        :value="optValue(opt as FlatOpt)"
        :selected="multiple && Array.isArray(selectValue) && selectValue.includes(optValue(opt as FlatOpt))"
        :disabled="(opt as FlatOpt).disabled"
      >
        {{ (opt as FlatOpt).label }}
      </option>
    </template>
  </select>
</template>
