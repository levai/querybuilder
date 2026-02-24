<script setup lang="ts">
import { computed } from 'vue';
import { QueryBuilder } from 'vue-querybuilder';
import type { QueryBuilderProps, RuleGroupTypeAny } from 'vue-querybuilder';
import { elementPlusControlElements } from './elementPlusControlElements';

defineOptions({ inheritAttrs: false });

/** 与 vue-querybuilder QueryBuilder 使用同一 props 定义，仅覆盖 controlElements，其它默认行为一致 */
const props = defineProps<QueryBuilderProps>();

const emit = defineEmits<{
  'update:modelValue': [value: RuleGroupTypeAny];
}>();

/** 与 QueryBuilder 内合并顺序一致：先 EP 控件，再用户覆盖（仅合并非空值，避免用户传 undefined 覆盖掉 EP 控件如 matchModeEditor） */
const controlElements = computed(() => {
  const base = { ...elementPlusControlElements };
  const user = props.controlElements ?? {};
  for (const [k, v] of Object.entries(user)) {
    if (v != null) (base as Record<string, unknown>)[k] = v;
  }
  return base;
});
</script>

<template>
  <div class="vue-querybuilder-element-plus">
    <QueryBuilder
      v-bind="props"
      :control-elements="controlElements"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>
