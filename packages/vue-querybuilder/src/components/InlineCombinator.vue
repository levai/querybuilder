<script setup lang="ts">
import { computed } from 'vue';
import { standardClassnames, TestID } from '@react-querybuilder/core';
import type { Path } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { useNativeInlineCombinatorDnD } from '../composables/useNativeInlineCombinatorDnD';

const props = withDefaults(
  defineProps<{
    options?: Array<{ name: string; label: string }>;
    value?: string;
    title?: string;
    className?: string;
    betweenRulesClassName?: string;
    handleOnChange?: (value: string) => void;
    disabled?: boolean;
    testId?: string;
    /** When set with dndRules, enables native DnD drop target for this combinator */
    dndPath?: Path;
    dndRules?: Array<RuleType | RuleGroupTypeAny | string>;
  }>(),
  { dndPath: undefined, dndRules: undefined }
);

// 使用 computed 实现 v-model 的双向绑定
const modelValue = computed({
  get() {
    return props.value ?? '';
  },
  set(newValue: string) {
    props.handleOnChange?.(newValue);
  },
});

const inlineDnd = useNativeInlineCombinatorDnD({
  path: computed(() => props.dndPath ?? []),
  rules: computed(() => props.dndRules ?? []),
});
const hasDnd = computed(() => props.dndPath != null && props.dndRules != null);
const inlineDndClass = computed(() => {
  const c: string[] = [];
  if (inlineDnd.isOver.value) c.push(standardClassnames.dndOver);
  if (inlineDnd.dropNotAllowed.value) c.push(standardClassnames.dndDropNotAllowed);
  if (inlineDnd.dropEffect.value === 'copy' && inlineDnd.isOver.value) c.push(standardClassnames.dndCopy);
  if (inlineDnd.groupItems.value && inlineDnd.isOver.value) c.push(standardClassnames.dndGroup);
  return c.filter(Boolean).join(' ');
});
</script>

<template>
  <div
    :ref="hasDnd ? inlineDnd.dropRef : undefined"
    :class="[props.betweenRulesClassName, hasDnd ? inlineDndClass : '']"
    :data-testid="props.testId ?? TestID.inlineCombinator"
    @dragover="hasDnd ? inlineDnd.onDragover($event) : undefined"
    @drop="hasDnd ? inlineDnd.onDrop($event) : undefined"
    @dragleave="hasDnd ? inlineDnd.onDragleave($event) : undefined"
  >
    <select
      v-model="modelValue"
      :title="props.title"
      :class="props.className"
      :disabled="props.disabled"
      :data-testid="TestID.combinators"
    >
      <option v-for="opt in props.options" :key="opt.name" :value="opt.name">{{ opt.label }}</option>
    </select>
  </div>
</template>
