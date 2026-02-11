<script setup lang="ts" generic="RG extends RuleGroupTypeAny, F extends FullField, O extends FullOperator, C extends FullCombinator">
import { computed, provide } from 'vue';
import type { Ref } from 'vue';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  GetOptionIdentifierType,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { rootPath, prepareRuleGroup, isRuleGroup } from '@react-querybuilder/core';
import type { QueryBuilderProps } from '../types';
import type { QueryBuilderContextType } from '../context/queryBuilderContext';
import { useQueryBuilder } from '../composables/useQueryBuilder';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { getQueriesStore } from '../state/queryStore';

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

// Log props changes for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log('[QueryBuilder] Props received:', {
    showCloneButtons: props.showCloneButtons,
    showLockButtons: props.showLockButtons,
    showMuteButtons: props.showMuteButtons,
    showNotToggle: props.showNotToggle,
    showShiftActions: props.showShiftActions,
    showCombinatorsBetweenRules: props.showCombinatorsBetweenRules,
    resetOnFieldChange: props.resetOnFieldChange,
    resetOnOperatorChange: props.resetOnOperatorChange,
    autoSelectField: props.autoSelectField,
    autoSelectOperator: props.autoSelectOperator,
    disabled: props.disabled,
    hasValidator: !!props.validator,
  });
}

// Create a wrapper function that calls both onUpdateModelValue (if provided) and emit
const onUpdateModelValue = (query: RG) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[QueryBuilder.onUpdateModelValue] Called with:', {
      queryRules: query.rules?.length,
    });
  }
  // Emit the event for v-model support
  emit('update:modelValue', query);
};

// IMPORTANT: useQueryBuilderSchema uses computed(() => props.xxx) to access props
// This means it expects props to be reactive. In Vue 3, defineProps() returns reactive props,
// but when we spread them with {...props}, we lose reactivity.
// Solution: Create a reactive proxy that forwards property access to the reactive props object
// This ensures Vue can track property access in computed properties
const reactivePropsProxy = new Proxy({} as QueryBuilderProps<RG, F, O, C> & { onUpdateModelValue: (query: RG) => void }, {
  get(_target, prop) {
    // Forward property access to the reactive props object
    if (prop === 'onUpdateModelValue') {
      return onUpdateModelValue;
    }
    // Access props directly - Vue will track this access
    return (props as any)[prop];
  },
  ownKeys() {
    // Return all keys from props plus onUpdateModelValue
    return [...Object.keys(props), 'onUpdateModelValue'];
  },
  has(_target, prop) {
    return prop === 'onUpdateModelValue' || prop in props;
  },
  getOwnPropertyDescriptor(_target, prop) {
    if (prop === 'onUpdateModelValue') {
      return {
        enumerable: true,
        configurable: true,
        value: onUpdateModelValue,
      };
    }
    const descriptor = Object.getOwnPropertyDescriptor(props, prop);
    return descriptor;
  },
});

const qb = useQueryBuilder<RG, F, O, C>(reactivePropsProxy);

// Get qbId from rqbContext - it should always be present
const qbId = qb.rqbContext.qbId;
if (!qbId) {
  throw new Error('qbId is required but not found in rqbContext');
}
const queriesStore = getQueriesStore();

// Get idGenerator from props (it's passed through to useQueryBuilderSchema)
const idGenerator = props.idGenerator ?? ((() => {
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
  const candidateQuery = storeQuery ?? props.modelValue ?? props.defaultQuery;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[QueryBuilder] rootGroup computed:', {
      hasStoreQuery: !!storeQuery,
      storeQueryRules: storeQuery?.rules?.length,
      hasModelValue: !!props.modelValue,
      modelValueRules: props.modelValue?.rules?.length,
      candidateQueryRules: candidateQuery?.rules?.length,
      qbId,
    });
  }
  
  if (!candidateQuery || !isRuleGroup(candidateQuery)) {
    // Fallback: use qb.rootGroup as last resort
    return qb.rootGroup;
  }
  return (candidateQuery.id ? candidateQuery : prepareRuleGroup(candidateQuery, { idGenerator })) as RuleGroupTypeAny;
});

// qb.schema is a computed ref, access its value
const schemaValue = qb.schema.value;
if (!schemaValue?.controls?.ruleGroup) {
  throw new Error('RuleGroup control element is not defined in schema');
}

const RuleGroupControlElement = schemaValue.controls.ruleGroup;

// Provide context to child components
// Note: schema is a computed ref, so we use it directly
// IMPORTANT: qb.schema is already a computed ref, so we can use it directly
const schemaRef = qb.schema;

// Use computed for contextValue to ensure reactivity
const contextValue = computed(() => ({
  ...qb.rqbContext,
  schema: schemaRef,
})) as unknown as Ref<QueryBuilderContextType<F, GetOptionIdentifierType<O>>>;

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
      :context="props.context"
    />
    <div v-else style="padding: 1rem; background: #f8d7da; color: #721c24;">
      Error: RuleGroupControlElement is not defined!
    </div>
  </div>
</template>
