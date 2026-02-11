<script setup lang="ts" generic="RG extends import('@react-querybuilder/core').RuleGroupTypeAny, F extends import('@react-querybuilder/core').FullField, O extends import('@react-querybuilder/core').FullOperator, C extends import('@react-querybuilder/core').FullCombinator">
import { computed, provide } from 'vue';
import { rootPath } from '@react-querybuilder/core';
import type { QueryBuilderProps } from '../types';
import { useQueryBuilderSchema } from '../composables/useQueryBuilderSchema';
import { defaultControlElements } from '../defaults';
import { DISPATCH_KEY, QUERY_BUILDER_CONTEXT_KEY, QUERY_REF_KEY } from '../context/queryBuilderContext';

defineOptions({ inheritAttrs: false });
const props = defineProps<QueryBuilderProps<RG, F, O, C>>();
const emit = defineEmits<{ 'update:modelValue': [query: RG] }>();

const mergedProps = computed(() => ({
  ...props,
  controlElements: { ...defaultControlElements, ...props.controlElements },
  onUpdateModelValue: (q: RG) => emit('update:modelValue', q),
}));

const qb = useQueryBuilderSchema<RG, F, O, C>(mergedProps as never);

const RuleGroupComponent = computed(() => qb.schema.value?.controls?.ruleGroup);
/** 解包为布尔值再传给子组件，否则子组件会收到 Ref 导致始终为 truthy 且切换不更新 */
const queryDisabledValue = computed(() => qb.queryDisabled.value);

provide(QUERY_REF_KEY, qb.queryRef);
provide(DISPATCH_KEY, qb.dispatchQuery);
provide(QUERY_BUILDER_CONTEXT_KEY, qb.rqbContext);
</script>

<template>
  <div
    role="form"
    :class="qb.wrapperClassName.value"
    :data-dnd="qb.dndEnabledAttr.value"
    :data-inlinecombinators="qb.inlineCombinatorsAttr.value"
  >
    <component
      v-if="RuleGroupComponent"
      :is="RuleGroupComponent"
      :path="rootPath"
      :shift-up-disabled="true"
      :shift-down-disabled="true"
      :parent-disabled="queryDisabledValue"
      :parent-muted="false"
      :context="props.context"
    />
  </div>
</template>
