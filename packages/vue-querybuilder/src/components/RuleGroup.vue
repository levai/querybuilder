<script setup lang="ts">
import { computed, inject } from 'vue';
import { standardClassnames, TestID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { useRuleGroup, type UseRuleGroupPathOptions } from '../composables/useRuleGroup';
import { useNativeRuleGroupDnD } from '../composables/useNativeRuleGroupDnD';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import RuleGroupHeaderComponents from './RuleGroupHeaderComponents.vue';
import RuleGroupBodyComponents from './RuleGroupBodyComponents.vue';

const props = defineProps<UseRuleGroupPathOptions>();

const ctx = inject(QUERY_BUILDER_CONTEXT_KEY);
const schemaVal = computed(() => (ctx?.value as { schema?: { value?: { enableDragAndDrop?: boolean; classNames?: Record<string, string> } } })?.schema?.value);

const r = useRuleGroup(props);

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}

const outerClass = computed(() => (unwrapRef(r.outerClassName) ?? '') as string);
const groupId = computed(() => (unwrapRef(r.id) ?? '') as string);
const classNamesVal = computed(() => (unwrapRef(r.classNames) ?? {}) as Record<string, string>);
const ruleGroupVal = computed(() => unwrapRef(r.ruleGroup) as RuleGroupTypeAny | null);
const disabledVal = computed(() => !!unwrapRef(r.disabled));

const schemaUnwrapped = computed(() => {
  const s = (r.schema as { value?: { controls?: { ruleGroupHeaderElements?: unknown; ruleGroupBodyElements?: unknown } } })?.value ?? r.schema;
  return s ?? {};
});
const controls = computed(() => (schemaUnwrapped.value as { controls?: { ruleGroupHeaderElements?: unknown; ruleGroupBodyElements?: unknown } })?.controls);
const RuleGroupHeaderElements = computed(() => controls.value?.ruleGroupHeaderElements ?? RuleGroupHeaderComponents);
const RuleGroupBodyElements = computed(() => controls.value?.ruleGroupBodyElements ?? RuleGroupBodyComponents);

const enableDropTargetsVal = computed(() => !!schemaVal.value?.enableDragAndDrop);

const ruleGroupDnd = useNativeRuleGroupDnD({
  path: computed(() => props.path),
  ruleGroup: ruleGroupVal,
  disabled: disabledVal,
});

const ruleGroupDndClass = computed(() => {
  if (!enableDropTargetsVal.value) return '';
  const c: string[] = [];
  if (ruleGroupDnd.isDragging.value && !schemaVal.value?.classNames?.dndDragging) c.push(standardClassnames.dndDragging);
  if (ruleGroupDnd.isOver.value && !schemaVal.value?.classNames?.dndOver) c.push(standardClassnames.dndOver);
  if (ruleGroupDnd.dropNotAllowed.value && !schemaVal.value?.classNames?.dndDropNotAllowed)
    c.push(standardClassnames.dndDropNotAllowed);
  if (ruleGroupDnd.dropEffect.value === 'copy' && ruleGroupDnd.isOver.value) c.push(standardClassnames.dndCopy);
  if (ruleGroupDnd.groupItems.value && ruleGroupDnd.isOver.value) c.push(standardClassnames.dndGroup);
  return c.filter(Boolean).join(' ');
});

const ruleGroupDndOuterClass = computed(() => {
  if (!enableDropTargetsVal.value) return '';
  const c: string[] = [];
  if (ruleGroupDnd.isDragging.value && !schemaVal.value?.classNames?.dndDragging) c.push(standardClassnames.dndDragging);
  if (ruleGroupDnd.groupItems.value && ruleGroupDnd.isOver.value && !schemaVal.value?.classNames?.dndGroup)
    c.push(standardClassnames.dndGroup);
  return c.filter(Boolean).join(' ');
});

const accessibleDescription = computed(() => (unwrapRef(r.accessibleDescription) ?? '') as string);
</script>

<template>
  <!-- noRootWrapper: 与 React 一致，dropRef + dndOver 在 header 上 -->
  <template v-if="props.noRootWrapper">
    <div
      ref="ruleGroupDnd.dropRef"
      :class="[classNamesVal.header, ruleGroupDndClass]"
      @dragover="enableDropTargetsVal ? ruleGroupDnd.onDragover($event) : undefined"
      @drop="enableDropTargetsVal ? ruleGroupDnd.onDrop($event) : undefined"
      @dragleave="enableDropTargetsVal ? ruleGroupDnd.onDragleave($event) : undefined"
    >
      <component
        :is="RuleGroupHeaderElements"
        :rg="r"
        :drag-handle-ref="ruleGroupDnd.dragHandleRef"
        :on-drag-start="ruleGroupDnd.onDragStart"
        :on-drag-end="ruleGroupDnd.onDragEnd"
      />
    </div>
    <div :class="classNamesVal.body">
      <component :is="RuleGroupBodyElements" :rg="r" :context="props.context" />
    </div>
  </template>
  <!-- 默认：外层 ruleGroup + header（drop 目标）+ body -->
  <div
    v-else
    :class="[outerClass, ruleGroupDndOuterClass]"
    :title="accessibleDescription"
    :data-testid="TestID.ruleGroup"
    :data-not="ruleGroupVal?.not ? 'true' : undefined"
    :data-rule-group-id="groupId"
    :data-level="props.path.length"
    :data-path="JSON.stringify(props.path)"
  >
    <div
      ref="ruleGroupDnd.dropRef"
      :class="[classNamesVal.header, ruleGroupDndClass]"
      @dragover="enableDropTargetsVal ? ruleGroupDnd.onDragover($event) : undefined"
      @drop="enableDropTargetsVal ? ruleGroupDnd.onDrop($event) : undefined"
      @dragleave="enableDropTargetsVal ? ruleGroupDnd.onDragleave($event) : undefined"
    >
      <component
        :is="RuleGroupHeaderElements"
        :rg="r"
        :drag-handle-ref="ruleGroupDnd.dragHandleRef"
        :on-drag-start="ruleGroupDnd.onDragStart"
        :on-drag-end="ruleGroupDnd.onDragEnd"
      />
    </div>
    <div :class="classNamesVal.body">
      <component :is="RuleGroupBodyElements" :rg="r" :context="props.context" />
    </div>
  </div>
</template>
