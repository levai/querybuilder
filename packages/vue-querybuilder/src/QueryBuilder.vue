<script setup lang="ts">
import { provide } from 'vue';
import RuleGroup from './components/RuleGroup.vue';
import { useQueryBuilder } from './composables/useQueryBuilder';
import { QUERY_BUILDER_CONTEXT_KEY } from './context/queryBuilderContext';
import { queryBuilderDefaults } from './defaults';
import type { QueryBuilderProps } from './types';
import type { RuleGroupTypeAny } from '@react-querybuilder/core';

const props = defineProps({
  modelValue: Object,
  defaultQuery: Object,
  fields: [Array, Object],
  baseField: Object,
  operators: Array,
  baseOperator: Object,
  combinators: Array,
  baseCombinator: Object,
  onUpdateModelValue: Function,
  showNotToggle: { type: Boolean, default: queryBuilderDefaults.showNotToggle },
  showShiftActions: { type: Boolean, default: queryBuilderDefaults.showShiftActions },
  showCloneButtons: { type: Boolean, default: queryBuilderDefaults.showCloneButtons },
  showLockButtons: { type: Boolean, default: queryBuilderDefaults.showLockButtons },
  showMuteButtons: { type: Boolean, default: queryBuilderDefaults.showMuteButtons },
  showCombinatorsBetweenRules: { type: Boolean, default: queryBuilderDefaults.showCombinatorsBetweenRules },
  independentCombinators: Boolean,
  showBranches: { type: Boolean, default: queryBuilderDefaults.showBranches },
  justifiedLayout: { type: Boolean, default: queryBuilderDefaults.justifiedLayout },
  disabled: { type: [Boolean, Array], default: false },
  autoSelectField: { type: Boolean, default: queryBuilderDefaults.autoSelectField },
  autoSelectOperator: { type: Boolean, default: queryBuilderDefaults.autoSelectOperator },
  autoSelectValue: { type: Boolean, default: queryBuilderDefaults.autoSelectValue },
  getOperators: Function,
  getDefaultField: [String, Function],
  getDefaultOperator: [String, Function],
  getDefaultValue: Function,
  idGenerator: Function,
  maxLevels: Number,
  resetOnFieldChange: { type: Boolean, default: queryBuilderDefaults.resetOnFieldChange },
  resetOnOperatorChange: { type: Boolean, default: queryBuilderDefaults.resetOnOperatorChange },
  addRuleToNewGroups: { type: Boolean, default: queryBuilderDefaults.addRuleToNewGroups },
  enableDragAndDrop: { type: Boolean, default: queryBuilderDefaults.enableDragAndDrop },
  debugMode: { type: Boolean, default: queryBuilderDefaults.debugMode },
  enableMountQueryChange: { type: Boolean, default: queryBuilderDefaults.enableMountQueryChange },
  listsAsArrays: { type: Boolean, default: queryBuilderDefaults.listsAsArrays },
  suppressStandardClassnames: { type: Boolean, default: queryBuilderDefaults.suppressStandardClassnames },
  validator: Function,
  onAddRule: Function,
  onAddGroup: Function,
  onRemove: Function,
  onMoveRule: Function,
  onMoveGroup: Function,
  onGroupRule: Function,
  onGroupGroup: Function,
  controls: Object,
  context: Object,
  translations: Object,
  getRuleClassname: Function,
  getRuleGroupClassname: Function,
  accessibleDescriptionGenerator: Function,
  parseNumbers: [Boolean, String],
  getValueEditorSeparator: Function,
  getValueSources: Function,
  getMatchModes: Function,
  getSubQueryBuilderProps: Function,
}) as unknown as QueryBuilderProps;

const emit = defineEmits<{ (e: 'update:modelValue', value: RuleGroupTypeAny): void }>();
const { query, contextValue } = useQueryBuilder(props, emit);
provide(QUERY_BUILDER_CONTEXT_KEY, contextValue);
</script>

<template>
  <div
    :class="[
      contextValue.classnames.queryBuilder,
      props.showBranches ? contextValue.classnames.branches : null,
      props.justifiedLayout ? contextValue.classnames.justified : null,
    ]"
    :dir="props.justifiedLayout ? 'ltr' : undefined"
    role="form"
  >
    <RuleGroup
      :key="(query?.rules?.length ?? 0) + '-' + (query?.id ?? '')"
      :id="query.id"
      :rule-group="query"
      :path="[]"
      :disabled="contextValue.disabled"
      :parent-disabled="false"
    />
  </div>
</template>
