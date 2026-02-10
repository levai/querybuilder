<script setup lang="ts" generic="Opt extends FullOption = FullOption">
import { computed } from 'vue';
import { toArray } from '@react-querybuilder/core';
import type { FullOption } from '@react-querybuilder/core';
import type { ValueSelectorProps } from '../types';
import { useValueSelector } from '../composables/useValueSelector';
import { useSelectElementChangeHandler } from '../composables/useSelectElementChangeHandler';
import { toOptions } from '../utils';

const props = defineProps<ValueSelectorProps<Opt>>();

const { onChange } = useValueSelector(props);

const val = computed(() => (props.multiple ? toArray(props.value) : props.value));

const selectElementChangeHandler = useSelectElementChangeHandler({
  multiple: props.multiple,
  onChange,
});

const options = computed(() => toOptions(props.options));
const optgroups = computed(() => options.value?.filter(o => o.type === 'optgroup') ?? []);
const flatOptions = computed(() => options.value?.filter(o => o.type === 'option') ?? []);
</script>

<template>
  <select
    :data-testid="props.testID"
    :class="props.className"
    :value="val"
    :title="props.title"
    :disabled="props.disabled"
    :multiple="!!props.multiple"
    @change="selectElementChangeHandler"
  >
    <template v-if="options">
      <optgroup
        v-for="(og, ogIndex) in optgroups"
        :key="ogIndex"
        :label="og.label"
      >
        <option
          v-for="(opt, optIndex) in og.options"
          :key="optIndex"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}
        </option>
      </optgroup>
      <option
        v-for="(opt, optIndex) in flatOptions"
        :key="optIndex"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </option>
    </template>
  </select>
</template>
