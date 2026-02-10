<script setup lang="ts">
import { generateId } from '../utils';
import type { NotToggleProps } from '../types';

const props = defineProps<NotToggleProps>();

const id = generateId();
</script>

<template>
  <label
    :data-testid="props.testID"
    :class="props.className"
    :title="props.title"
    :for="id"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="!!props.checked"
      :disabled="props.disabled"
      @change="(e) => props.handleOnChange((e.target as HTMLInputElement).checked)"
    />
    {{ props.label }}
  </label>
</template>
