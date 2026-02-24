<script setup lang="ts">
import { computed } from 'vue';
import {
  standardClassnames,
  TestID,
  useNativeInlineCombinatorDnD,
  type Path,
  type RuleGroupTypeAny,
  type RuleType,
} from 'vue-querybuilder';
import ElValueSelector from './ElValueSelector.vue';

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
    dndPath?: Path;
    dndRules?: Array<RuleType | RuleGroupTypeAny | string>;
  }>(),
  { dndPath: undefined, dndRules: undefined }
);

function onChange(v: string | string[]) {
  props.handleOnChange?.(Array.isArray(v) ? v[0] ?? '' : v);
}

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
    :class="[betweenRulesClassName, hasDnd ? inlineDndClass : '']"
    :data-testid="testId ?? TestID.inlineCombinator"
    @dragover="hasDnd ? inlineDnd.onDragover($event) : undefined"
    @drop="hasDnd ? inlineDnd.onDrop($event) : undefined"
    @dragleave="hasDnd ? inlineDnd.onDragleave($event) : undefined"
  >
    <ElValueSelector
      :value="value ?? ''"
      :options="options ?? []"
      :title="title"
      :class-name="className"
      :disabled="disabled"
      :test-id="TestID.combinators"
      :handle-on-change="onChange"
    />
  </div>
</template>
