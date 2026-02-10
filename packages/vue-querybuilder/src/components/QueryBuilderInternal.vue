<script setup lang="ts" generic="RG extends RuleGroupTypeAny, F extends FullField, O extends FullOperator, C extends FullCombinator">
import { computed, provide, ref, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { rootPath, prepareRuleGroup } from '@react-querybuilder/core';
import type { QueryBuilderProps } from '../types';
import type { QueryBuilderContextType } from '../context/queryBuilderContext';
import { useQueryBuilder } from '../composables/useQueryBuilder';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { getQueriesStore } from '../state/queryStore';
import RuleGroup from './RuleGroup.vue';

const props = defineProps<{
  props: QueryBuilderProps<RG, F, O, C>;
}>();

const qb = useQueryBuilder<RG, F, O, C>(props.props);

// Get qbId from rqbContext - it should always be present
const qbId = qb.rqbContext.qbId;
if (!qbId) {
  throw new Error('qbId is required but not found in rqbContext');
}
const queriesStore = getQueriesStore();

// Get idGenerator from props (it's passed through to useQueryBuilderSchema)
const idGenerator = props.props.idGenerator ?? ((() => {
  // Fallback idGenerator if not provided
  let counter = 0;
  return () => `id-${++counter}`;
})());

// Create a reactive rootGroup that directly accesses the store
// This ensures Vue can track changes to queriesStore.value[qbId]
// IMPORTANT: Always use store value for rendering, as it's the source of truth.
// The store is updated by dispatchQuery, and in controlled mode, modelValue
// is synced to store via watch in useQueryBuilderSchema.
// When store updates, rootGroup computed will automatically re-evaluate.
const rootGroup = computed(() => {
  // Access queriesStore.value[qbId] directly to ensure reactivity
  const storeQuery = queriesStore.value[qbId];
  // Always use store value if available, as it's the source of truth
  // In controlled mode, modelValue is synced to store via watch
  // In uncontrolled mode, store is updated directly
  const candidateQuery = storeQuery ?? props.props.modelValue ?? props.props.defaultQuery;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[QueryBuilderInternal] rootGroup computed:', {
      hasStoreQuery: !!storeQuery,
      storeQueryRules: storeQuery?.rules?.length,
      hasModelValue: !!props.props.modelValue,
      modelValueRules: props.props.modelValue?.rules?.length,
      candidateQueryRules: candidateQuery?.rules?.length,
      qbId,
    });
  }
  
  if (!candidateQuery) {
    // Fallback: use qb.rootGroup as last resort
    return qb.rootGroup;
  }
  return (candidateQuery.id ? candidateQuery : prepareRuleGroup(candidateQuery, { idGenerator })) as RuleGroupTypeAny;
});

if (!qb.schema?.controls?.ruleGroup) {
  throw new Error('RuleGroup control element is not defined in schema');
}

const RuleGroupControlElement = qb.schema.controls.ruleGroup;

// Provide context to child components
// Note: schema needs to be a Ref<Schema> in the context
// Since qb.schema is already a plain object (not reactive), we wrap it in ref
// IMPORTANT: Use shallowRef to prevent Vue from auto-unwrapping nested refs
const schemaRef = shallowRef(qb.schema);

// Use shallowRef for contextValue to prevent auto-unwrapping of nested refs
const contextValue = shallowRef({
  ...qb.rqbContext,
  schema: schemaRef,
}) as unknown as Ref<QueryBuilderContextType<F, GetOptionIdentifierType<O>>>;

provide(QUERY_BUILDER_CONTEXT_KEY, contextValue);
</script>

<template>
  <div
    role="form"
    :class="qb.wrapperClassName"
    :data-dnd="qb.dndEnabledAttr"
    :data-inlinecombinators="qb.inlineCombinatorsAttr"
  >
    <component
      v-if="RuleGroupControlElement"
      :is="RuleGroupControlElement"
      :translations="qb.translations"
      :rule-group="rootGroup"
      :rules="rootGroup.rules"
      v-bind="qb.combinatorPropObject"
      :not="!!rootGroup.not"
      :actions="qb.actions"
      :id="rootGroup.id"
      :path="rootPath"
      :disabled="qb.rootGroupDisabled"
      :shift-up-disabled="true"
      :shift-down-disabled="true"
      :parent-disabled="qb.queryDisabled"
      :context="props.props.context"
    />
    <div v-else style="padding: 1rem; background: #f8d7da; color: #721c24;">
      Error: RuleGroupControlElement is not defined!
    </div>
  </div>
</template>
