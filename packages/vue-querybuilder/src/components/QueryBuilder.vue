<script setup lang="ts" generic="RG extends RuleGroupTypeAny, F extends FullField, O extends FullOperator, C extends FullCombinator">
import type {
  FullCombinator,
  FullField,
  FullOperator,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import type { QueryBuilderProps } from '../types';
import QueryBuilderInternal from './QueryBuilderInternal.vue';

/**
 * The query builder component for Vue 3.
 *
 * @group Components
 */
const props = defineProps<QueryBuilderProps<RG, F, O, C>>();

// Define emits for v-model support
const emit = defineEmits<{
  'update:modelValue': [query: RG];
}>();

// Create a wrapper function that calls both onUpdateModelValue (if provided) and emit
const onUpdateModelValue = (query: RG) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[QueryBuilder.onUpdateModelValue] Called with:', {
      hasPropsOnUpdateModelValue: typeof props.onUpdateModelValue === 'function',
      queryRules: query.rules?.length,
    });
  }
  // Call the prop callback if provided (for direct prop usage)
  if (typeof props.onUpdateModelValue === 'function') {
    props.onUpdateModelValue(query);
  }
  // Emit the event for v-model support
  emit('update:modelValue', query);
};

// Pass the wrapper function as onUpdateModelValue prop
const internalProps = {
  ...props,
  onUpdateModelValue,
} as QueryBuilderProps<RG, F, O, C>;
</script>

<template>
  <QueryBuilderInternal :props="internalProps" />
</template>
