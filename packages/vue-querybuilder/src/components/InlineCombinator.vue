<script setup lang="ts">
import { clsx, standardClassnames, TestID } from '@react-querybuilder/core';
import type { InlineCombinatorProps } from '../types';
import { computed } from 'vue';

const props = defineProps<InlineCombinatorProps>();

const { component: CombinatorSelectorComponent } = props;

const className = computed(() =>
  clsx(
    props.schema.suppressStandardClassnames || standardClassnames.betweenRules,
    props.schema.classNames.betweenRules
  )
);
</script>

<template>
  <div :class="className" :data-testid="TestID.inlineCombinator">
    <component
      :is="CombinatorSelectorComponent"
      :schema="props.schema"
      :test-id="TestID.combinators"
      :class="props.className"
      :title="props.title"
      :disabled="props.disabled"
      :handle-on-change="props.handleOnChange"
      :value="props.value"
      :options="props.options"
      :multiple="props.multiple"
      :lists-as-arrays="props.listsAsArrays"
      :path="props.path"
      :level="props.level"
      :rules="props.rules"
      :rule-group="props.ruleGroup"
    />
  </div>
</template>
