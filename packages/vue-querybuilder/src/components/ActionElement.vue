<script setup lang="ts">
import type { ActionProps } from '../types';

const props = defineProps<ActionProps>();
</script>

<template>
  <button
    type="button"
    :data-testid="props.testID"
    :disabled="props.disabled && !props.disabledTranslation"
    :class="props.className"
    :title="props.disabledTranslation && props.disabled ? props.disabledTranslation.title : props.title"
    @click="(e) => props.handleOnClick(e as MouseEvent)"
  >
    {{ props.disabledTranslation && props.disabled ? props.disabledTranslation.label : props.label }}
  </button>
</template>
