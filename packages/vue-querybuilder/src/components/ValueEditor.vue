<script setup lang="ts">
import { parseNumber } from '@react-querybuilder/core';
import type {
  FullField,
  FullOption,
  InputType,
  ParseNumbersPropConfig,
  ValueEditorType,
} from '@react-querybuilder/core';
import { computed } from 'vue';
import { useValueEditor } from '../composables/useValueEditor';

const props = withDefaults(
  defineProps<{
    modelValue: string | number | boolean | (string | null)[];
    operator?: string;
    valueEditorType?: ValueEditorType;
    inputType?: InputType | null;
    options?: FullOption[];
    placeholder?: string;
    disabled?: boolean;
    separator?: string | import('vue').VNode;
    listsAsArrays?: boolean;
    fieldData?: FullField;
    parseNumbers?: ParseNumbersPropConfig;
    valueSource?: 'value' | 'field';
    testID?: string;
    valueEditorProps?: Record<string, unknown>;
  }>(),
  { operator: '', valueEditorType: 'text', listsAsArrays: false }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | (string | null)[]): void;
}>();

const handleOnChange = (v: unknown) => {
  emit('update:modelValue', v as string | number | boolean | (string | null)[]);
};

const effectivePlaceholder = computed(() => props.fieldData?.placeholder ?? props.placeholder);

const typeForHook = computed(() => props.valueEditorType ?? 'text');

const {
  valueAsArray,
  multiValueHandler,
  parseNumberMethod,
  inputTypeCoerced,
} = useValueEditor({
  value: props.modelValue,
  operator: props.operator,
  handleOnChange,
  inputType: props.inputType,
  listsAsArrays: props.listsAsArrays,
  parseNumbers: props.parseNumbers,
  values: props.options ?? [],
  type: () => typeForHook.value,
  skipHook: false,
  suppressStandardClassnames: false,
});

const isBetween = computed(
  () => (props.operator === 'between' || props.operator === 'notBetween')
);
const isMultiselect = computed(() => props.valueEditorType === 'multiselect');
const isSelect = computed(() => props.valueEditorType === 'select' || props.valueEditorType === 'radio');
const isCheckbox = computed(() => props.valueEditorType === 'checkbox');

function handleInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const method = parseNumberMethod.value;
  const parsed = parseNumber(target.value, { parseNumbers: method });
  emit('update:modelValue', parsed);
}

function handleCheckboxChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
}

function handleSelectChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  if (isMultiselect.value) {
    const selectedValues = Array.from(target.selectedOptions).map(opt => opt.value);
    emit('update:modelValue', props.listsAsArrays ? selectedValues : selectedValues.join(','));
  } else {
    emit('update:modelValue', target.value);
  }
}

function handleBetweenInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  multiValueHandler(target.value, index);
}
</script>

<template>
  <!-- Between / NotBetween: 双输入框，使用 useValueEditor 的 valueAsArray / multiValueHandler -->
  <template v-if="isBetween">
    <input
      :data-testid="testID ? `${testID}-0` : undefined"
      :type="inputTypeCoerced"
      :value="valueAsArray[0] ?? ''"
      :placeholder="effectivePlaceholder"
      :disabled="disabled"
      v-bind="valueEditorProps"
      @input="handleBetweenInput(0, $event)"
    />
    <span v-if="separator">{{ separator }}</span>
    <input
      :data-testid="testID ? `${testID}-1` : undefined"
      :type="inputTypeCoerced"
      :value="valueAsArray[1] ?? ''"
      :placeholder="effectivePlaceholder"
      :disabled="disabled"
      v-bind="valueEditorProps"
      @input="handleBetweenInput(1, $event)"
    />
  </template>

  <!-- Multiselect: 多选下拉框 -->
  <select
    v-else-if="isMultiselect"
    :data-testid="testID"
    multiple
    :disabled="disabled"
    v-bind="valueEditorProps"
    @change="handleSelectChange"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :selected="Array.isArray(modelValue) && modelValue.includes(option.value)"
    >
      {{ option.label }}
    </option>
  </select>

  <!-- Select / Radio: 单选下拉框 -->
  <select
    v-else-if="isSelect"
    :data-testid="testID"
    :value="modelValue"
    :disabled="disabled"
    v-bind="valueEditorProps"
    @change="handleSelectChange"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>

  <!-- Checkbox: 复选框 -->
  <input
    v-else-if="isCheckbox"
    :data-testid="testID"
    type="checkbox"
    :checked="modelValue === true"
    :disabled="disabled"
    v-bind="valueEditorProps"
    @change="handleCheckboxChange"
  />

  <!-- Text / Number / Date 等: 单输入框，使用 parseNumber 当 parseNumbers 启用 -->
  <input
    v-else
    :data-testid="testID"
    :type="inputTypeCoerced"
    :value="valueAsArray[0] ?? modelValue"
    :placeholder="effectivePlaceholder"
    :disabled="disabled"
    v-bind="valueEditorProps"
    @input="handleInputChange"
  />
</template>
