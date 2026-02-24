<script setup lang="ts">
import { computed, watch } from 'vue';
import { toArray, joinWith, getFirstOption, toOptions, type FullField, type OptionList } from 'vue-querybuilder';
import {
  ElInput,
  ElInputNumber,
  ElCheckbox,
  ElSwitch,
  ElRadioGroup,
  ElRadio,
  ElDatePicker,
  ElTimePicker,
} from 'element-plus';
import ElValueSelector from './ElValueSelector.vue';

const props = withDefaults(
  defineProps<{
    value?: unknown;
    type?: string;
    inputType?: string | null;
    operator?: string;
    disabled?: boolean;
    className?: string;
    valueListItemClassName?: string;
    title?: string;
    placeholder?: string;
    handleOnChange?: (value: unknown) => void;
    values?: Array<{ name: string; label: string }> | Array<{ type: 'optgroup'; label: string; options: Array<{ name: string; label: string }> }>;
    multiple?: boolean;
    testId?: string;
    parseNumbers?: boolean;
    listsAsArrays?: boolean;
    separator?: string | null;
    /** 当前 field 的配置（Rule 传入），可从 field.valueEditorProps 取透传参数给子组件 */
    fieldData?: FullField;
  }>(),
  { type: 'text', multiple: false, parseNumbers: false, listsAsArrays: false, operator: '', separator: null }
);

const optionsForSelect = computed(() => toOptions(props.values as OptionList) ?? []);

const optionsFlatForRadio = computed(() =>
  optionsForSelect.value.flatMap(
    (o: { type?: string; value?: string; label?: string; options?: Array<{ value?: string; label?: string }> }) =>
      o.type === 'optgroup' ? (o.options ?? []) : [{ value: o.value, label: o.label }]
  )
);

const valueAsArray = computed(() => toArray(props.value, { retainEmptyStrings: true }));

const valueForSelector = computed((): string | string[] | null | undefined => {
  const v = props.value;
  if (v == null) {
    const firstOpt = getFirstOption(props.values as OptionList);
    return firstOpt != null ? String(firstOpt) : '~';
  }
  if (Array.isArray(v)) return v as string[];
  return String(v);
});

const displayValue = computed(() => {
  const v = props.value;
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v[0] ?? '';
  if (typeof v === 'bigint') return `${v}`;
  return String(v);
});

const inputTypeCoerced = computed(() => {
  if (props.inputType === 'bigint' || props.operator === 'in' || props.operator === 'notIn') {
    return 'text';
  }
  return props.inputType ?? 'text';
});

const isBetween = computed(() => {
  const op = (props.operator ?? '').toString().toLowerCase();
  return op === 'between' || op === 'notbetween';
});

const showBetweenInputs = computed(() => isBetween.value && (props.type === 'text' || props.type === 'select'));

const isDateType = computed(() => props.inputType === 'date');
const isTimeType = computed(() => props.inputType === 'time');
const isDateTimeType = computed(() => props.inputType === 'datetime-local');

const firstOptionName = computed(() => {
  const firstOpt = getFirstOption(props.values as OptionList);
  return firstOpt != null ? String(firstOpt) : '';
});

watch(
  () => [props.operator, props.value, props.inputType, props.type] as const,
  () => {
    if (!props.handleOnChange) return;
    if (props.type === 'multiselect') return;
    if (['between', 'notBetween', 'in', 'notIn'].includes(props.operator ?? '')) return;
    const v = props.value;
    const isArray = Array.isArray(v);
    const isNumberComma = props.inputType === 'number' && typeof v === 'string' && (v as string).includes(',');
    if (isArray || isNumberComma) {
      const first = toArray(v, { retainEmptyStrings: true })[0] ?? '';
      props.handleOnChange(first);
    }
  },
  { flush: 'post' }
);

function multiValueHandler(val: unknown, idx: number) {
  const arr = [...valueAsArray.value];
  const needsBetweenFix = idx === 0 && arr.length < 2;
  if (arr[idx] === val && !needsBetweenFix) {
    props.handleOnChange?.(props.listsAsArrays ? arr : joinWith(arr, ','));
    return;
  }
  arr[idx] = val;
  if (needsBetweenFix) arr[1] = firstOptionName.value;
  props.handleOnChange?.(props.listsAsArrays ? arr : joinWith(arr, ','));
}

function bigIntValueHandler(val: unknown) {
  const valAsMaybeNumber = props.parseNumbers && typeof val === 'string' ? Number(val) : val;
  try {
    const bi = BigInt(valAsMaybeNumber as string | number | bigint | boolean);
    props.handleOnChange?.(bi);
  } catch {
    props.handleOnChange?.(valAsMaybeNumber);
  }
}

function onInputChange(raw: string) {
  if (props.inputType === 'bigint') {
    bigIntValueHandler(raw);
    return;
  }
  if (props.parseNumbers && (props.inputType === 'number' || props.inputType === 'range')) {
    const n = Number(raw);
    const out = raw === '' ? null : (Number.isNaN(n) ? raw : n);
    props.handleOnChange?.(out);
  } else {
    props.handleOnChange?.(raw);
  }
}

function onCheckboxChange(checked: unknown) {
  props.handleOnChange?.(!!checked);
}

function onSelectChange(v: string | string[]) {
  props.handleOnChange?.(props.multiple ? v : (Array.isArray(v) ? v[0] : v));
}

const radioName = computed(() => `ve-${props.testId ?? 'radio'}`);

/** 从 field.valueEditorProps 取到的透传参数（如 number 的 min、max、step），类型定义在 @react-querybuilder/core */
const valueEditorProps = computed(() => {
  return props.fieldData?.valueEditorProps ?? {};
});

/** number 类型给 ElInputNumber 用的数值（空为 undefined） */
const numberValue = computed(() => {
  if (props.inputType !== 'number') return undefined;
  const v = props.value;
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
});

function onInputNumberChange(val: number | undefined) {
  if (val === undefined || val === null) {
    props.handleOnChange?.(props.parseNumbers ? null : '');
    return;
  }
  props.handleOnChange?.(props.parseNumbers ? val : String(val));
}
</script>

<template>
  <!-- between/notBetween: 双输入 -->
  <span
    v-if="showBetweenInputs"
    :class="[className, 'value-editor-between']"
    :title="title"
    :data-testid="testId"
  >
    <template v-if="type === 'text' && isDateType">
      <ElDatePicker
        v-bind="valueEditorProps"
        :model-value="valueAsArray[0] ?? ''"
        type="date"
        value-format="YYYY-MM-DD"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v ?? '', 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ElDatePicker
        v-bind="valueEditorProps"
        :model-value="valueAsArray[1] ?? ''"
        type="date"
        value-format="YYYY-MM-DD"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v ?? '', 1)"
      />
    </template>
    <template v-else-if="type === 'text' && isDateTimeType">
      <ElDatePicker
        v-bind="valueEditorProps"
        :model-value="valueAsArray[0] ?? ''"
        type="datetime"
        value-format="YYYY-MM-DDTHH:mm:ss"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v ?? '', 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ElDatePicker
        v-bind="valueEditorProps"
        :model-value="valueAsArray[1] ?? ''"
        type="datetime"
        value-format="YYYY-MM-DDTHH:mm:ss"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v ?? '', 1)"
      />
    </template>
    <template v-else-if="type === 'text' && inputType === 'number'">
      <ElInputNumber
        v-bind="valueEditorProps"
        :model-value="valueAsArray[0] != null && valueAsArray[0] !== '' ? Number(valueAsArray[0]) : undefined"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        controls-position="right"
        @update:model-value="(v: number | undefined) => multiValueHandler(v != null ? v : '', 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ElInputNumber
        v-bind="valueEditorProps"
        :model-value="valueAsArray[1] != null && valueAsArray[1] !== '' ? Number(valueAsArray[1]) : undefined"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        controls-position="right"
        @update:model-value="(v: number | undefined) => multiValueHandler(v != null ? v : '', 1)"
      />
    </template>
    <template v-else-if="type === 'text'">
      <ElInput
        v-bind="valueEditorProps"
        :model-value="valueAsArray[0] ?? ''"
        :type="inputTypeCoerced"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v, 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ElInput
        v-bind="valueEditorProps"
        :model-value="valueAsArray[1] ?? ''"
        :type="inputTypeCoerced"
        :class="valueListItemClassName"
        :placeholder="placeholder"
        :disabled="disabled"
        @update:model-value="(v: string) => multiValueHandler(v, 1)"
      />
    </template>
    <template v-else>
      <ElValueSelector
        v-bind="valueEditorProps"
        :value="valueAsArray[0] ?? firstOptionName"
        :options="optionsForSelect"
        :disabled="disabled"
        :handle-on-change="(v: string | string[]) => multiValueHandler(Array.isArray(v) ? v[0] : v, 0)"
      />
      <span v-if="separator != null && typeof separator === 'string'" class="value-separator">{{ separator }}</span>
      <ElValueSelector
        v-bind="valueEditorProps"
        :value="valueAsArray[1] ?? firstOptionName"
        :options="optionsForSelect"
        :disabled="disabled"
        :handle-on-change="(v: string | string[]) => multiValueHandler(Array.isArray(v) ? v[0] : v, 1)"
      />
    </template>
  </span>
  <!-- radio -->
  <ElRadioGroup
    v-else-if="type === 'radio'"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    :class="className"
    :disabled="disabled"
    :name="radioName"
    @update:model-value="handleOnChange"
  >
    <ElRadio
      v-for="opt in optionsFlatForRadio"
      :key="opt?.value"
      :value="opt?.value"
      :label="opt?.value"
    >
      {{ opt?.label }}
    </ElRadio>
  </ElRadioGroup>
  <!-- select / multiselect -->
  <ElValueSelector
    v-else-if="type === 'select' || type === 'multiselect'"
    v-bind="valueEditorProps"
    :value="valueForSelector"
    :options="optionsForSelect"
    :title="title"
    :class-name="className"
    :disabled="disabled"
    :multiple="type === 'multiselect'"
    :test-id="testId"
    :handle-on-change="onSelectChange"
  />
  <!-- checkbox -->
  <ElCheckbox
    v-else-if="type === 'checkbox'"
    v-bind="valueEditorProps"
    :model-value="!!value"
    :class="className"
    :title="title"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="onCheckboxChange"
  />
  <!-- switch -->
  <ElSwitch
    v-else-if="type === 'switch'"
    v-bind="valueEditorProps"
    :model-value="!!value"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="onCheckboxChange"
  />
  <!-- textarea -->
  <ElInput
    v-else-if="type === 'textarea'"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    type="textarea"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    :autosize="{ minRows: 1, maxRows: 4 }"
    @update:model-value="(v: string) => handleOnChange?.(v)"
  />
  <!-- date -->
  <ElDatePicker
    v-else-if="isDateType"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    type="date"
    value-format="YYYY-MM-DD"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="(v: string) => handleOnChange?.(v ?? '')"
  />
  <!-- time -->
  <ElTimePicker
    v-else-if="isTimeType"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    value-format="HH:mm"
    format="HH:mm"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="(v: string) => handleOnChange?.(v ?? '')"
  />
  <!-- datetime-local -->
  <ElDatePicker
    v-else-if="isDateTimeType"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    type="datetime"
    value-format="YYYY-MM-DDTHH:mm:ss"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="(v: string) => handleOnChange?.(v ?? '')"
  />
  <!-- bigint -->
  <ElInput
    v-else-if="inputType === 'bigint'"
    v-bind="valueEditorProps"
    :model-value="displayValue"
    type="text"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="(v: string) => onInputChange(v ?? '')"
  />
  <!-- number：使用 ElInputNumber，透传 field.valueEditorProps（如 min、max、step） -->
  <ElInputNumber
    v-else-if="inputType === 'number'"
    v-bind="valueEditorProps"
    :model-value="numberValue"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    controls-position="right"
    @update:model-value="onInputNumberChange"
  />
  <!-- default text / etc. -->
  <ElInput
    v-else
    v-bind="valueEditorProps"
    :model-value="displayValue"
    :type="inputTypeCoerced"
    :placeholder="placeholder"
    :title="title"
    :class="className"
    :disabled="disabled"
    :data-testid="testId"
    @update:model-value="(v: string) => onInputChange(v ?? '')"
  />
</template>

<style scoped>
.value-separator {
  margin: 0 4px;
  color: var(--el-text-color-secondary);
}
</style>
