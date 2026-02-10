<script setup lang="ts">
import { inject, computed } from 'vue';
import ValueSelector from './ValueSelector.vue';
import type { CombinatorSelectorProps, Schema } from '../types';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';

const props = defineProps<CombinatorSelectorProps>();

const schemaRef = inject(QUERY_BUILDER_CONTEXT_KEY);
if (!schemaRef) {
  throw new Error('CombinatorSelector must be used within QueryBuilder');
}

// Extract schema from context - schema is nested in QueryBuilderContextType as Ref<Schema>
const schema = computed((): Schema => {
  const contextValue = schemaRef.value;
  // If schema is provided as Ref<Schema>, unwrap it
  if (contextValue.schema) {
    return contextValue.schema.value;
  }
  // Otherwise, context itself should be the schema (for backward compatibility)
  // This should not happen in normal usage, but we provide a fallback
  throw new Error('Schema not found in QueryBuilder context');
});
</script>

<template>
  <ValueSelector
    :test-id="props.testID"
    :class="props.className"
    :title="props.title"
    :disabled="props.disabled"
    :value="props.value"
    :options="props.options"
    :handle-on-change="props.handleOnChange"
    :path="props.path"
    :level="props.level"
    :schema="schema"
  />
</template>
