<script setup lang="ts">
import { type ComputedRef, type Ref, computed, defineAsyncComponent, inject, reactive } from 'vue';
import { useRuleGroup, type UseRuleGroup, type UseRuleGroupProps } from '../composables/useRuleGroup';
import { useDeprecatedProps } from '../composables/useDeprecatedProps';
import { isRuleGroup, pathsAreEqual } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import CombinatorSelector from './CombinatorSelector.vue';
import NotToggle from './NotToggle.vue';
import ActionElement from './ActionElement.vue';
import InlineCombinator from './InlineCombinator.vue';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { useRuleGroupDnD } from '../composables/useRuleGroupDnD';

type UnwrapRefs<T> = { [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K] extends ComputedRef<infer V> ? V : T[K] };

const RuleGroupRecursive = defineAsyncComponent(() => import('./RuleGroup.vue'));
const Rule = defineAsyncComponent(() => import('./Rule.vue'));

const props = defineProps<Omit<UseRuleGroupProps, 'schema'>>();

const schemaRef = inject(QUERY_BUILDER_CONTEXT_KEY);
if (!schemaRef) {
  throw new Error('RuleGroup must be used within QueryBuilder');
}

useDeprecatedProps('ruleGroup', !props.ruleGroup);

const rgRef = useRuleGroup({
  ...props,
  schema: schemaRef,
} as UseRuleGroupProps);

/** reactive 包装后，模板中访问属性时 Vue 会自动解包 ref */
const rg = reactive(rgRef) as UnwrapRefs<UseRuleGroup>;

const dnd = useRuleGroupDnD({
  path: props.path,
  ruleGroup: props.ruleGroup,
  schema: schemaRef,
  disabled: rgRef.disabled,
});

// 阻止事件冒泡的辅助函数
const stopPropagation = (fn: (event?: MouseEvent, context?: unknown) => void) => {
  return (event?: MouseEvent, context?: unknown) => {
    event?.stopPropagation();
    fn(event, context);
  };
};

const addRule = stopPropagation(rgRef.addRule);
const addGroup = stopPropagation(rgRef.addGroup);
const cloneGroup = stopPropagation(rgRef.cloneGroup);
const toggleLockGroup = stopPropagation(rgRef.toggleLockGroup);
const toggleMuteGroup = stopPropagation(rgRef.toggleMuteGroup);
const removeGroup = stopPropagation(rgRef.removeGroup);
const shiftGroupUp = stopPropagation(rgRef.shiftGroupUp);
const shiftGroupDown = stopPropagation(rgRef.shiftGroupDown);

const shiftTitles = computed(() => {
  const schema = schemaRef!.value;
  return schema.showShiftActions
    ? {
        up: schema.translations.shiftActionUp?.title,
        down: schema.translations.shiftActionDown?.title,
      }
    : undefined;
});

const shiftLabels = computed(() => {
  const schema = schemaRef!.value;
  return schema.showShiftActions
    ? {
        up: schema.translations.shiftActionUp?.label,
        down: schema.translations.shiftActionDown?.label,
      }
    : undefined;
});

</script>

<template>
  <div
    :ref="dnd.dropRef"
    :title="rg.accessibleDescription"
    :class="[rg.outerClassName, dnd.isOver && 'query-builder-drag-over', dnd.dropNotAllowed && 'query-builder-drag-over-not-allowed']"
    data-testid="rule-group"
    :data-not="rg.ruleGroup.not ? 'true' : undefined"
    :data-rule-group-id="props.id"
    :data-level="props.path.length"
    :data-path="JSON.stringify(props.path)"
  >
    <!-- Header -->
    <div :class="rg.classNames.header">
      <!-- ShiftActions -->
      <ShiftActions
        v-if="schemaRef.showShiftActions && props.path.length > 0"
        :path="props.path"
        :disabled="rg.disabled"
        :labels="shiftLabels"
        :titles="shiftTitles"
        :shift-up-disabled="props.shiftUpDisabled"
        :shift-down-disabled="props.shiftDownDisabled"
        @shift-up="shiftGroupUp"
        @shift-down="shiftGroupDown"
      />

      <!-- DragHandle (@vue-dnd-kit: dragRef 必须始终绑定到 DOM，否则 mounted 报 ElementRef is not set) -->
      <span
        v-show="props.path.length > 0 && schemaRef.enableDragAndDrop"
        :ref="dnd.dragRef"
        @pointerdown="dnd.handleDragStart"
      >
        <DragHandle
          v-if="props.path.length > 0 && schemaRef.enableDragAndDrop"
          :rule-or-group="rg.ruleGroup"
          :path="props.path"
          :disabled="rg.disabled"
          :title="schemaRef.translations.dragHandle?.title"
          :label="schemaRef.translations.dragHandle?.label"
        />
      </span>

      <!-- CombinatorSelector -->
      <CombinatorSelector
        v-if="!schemaRef.showCombinatorsBetweenRules && !schemaRef.independentCombinators"
        :model-value="rg.combinator"
        :options="schemaRef.combinators"
        :title="schemaRef.translations.combinators?.title"
        :disabled="rg.disabled"
        @update:model-value="rg.onCombinatorChange"
      />

      <!-- NotToggle -->
      <NotToggle
        v-if="schemaRef.showNotToggle"
        :model-value="!!rg.ruleGroup.not"
        :label="schemaRef.translations.notToggle?.label"
        :title="schemaRef.translations.notToggle?.title"
        :disabled="rg.disabled"
        @update:model-value="rg.onNotToggleChange"
      />

      <!-- AddRuleAction -->
      <ActionElement
        :label="schemaRef.translations.addRule?.label"
        :title="schemaRef.translations.addRule?.title"
        :disabled="rg.disabled"
        :action-class="rg.classNames.addRule"
        @click="addRule"
      />

      <!-- AddGroupAction -->
      <ActionElement
        v-if="schemaRef.maxLevels && schemaRef.maxLevels > props.path.length"
        :label="schemaRef.translations.addGroup?.label"
        :title="schemaRef.translations.addGroup?.title"
        :disabled="rg.disabled"
        :action-class="rg.classNames.addGroup"
        @click="addGroup"
      />

      <!-- CloneGroupAction -->
      <ActionElement
        v-if="schemaRef.showCloneButtons && props.path.length > 0"
        :label="schemaRef.translations.cloneRuleGroup?.label"
        :title="schemaRef.translations.cloneRuleGroup?.title"
        :disabled="rg.disabled"
        :action-class="rg.classNames.cloneGroup"
        @click="cloneGroup"
      />

      <!-- LockGroupAction -->
      <ActionElement
        v-if="schemaRef.showLockButtons"
        :label="
          rg.disabled
            ? schemaRef.translations.lockGroupDisabled?.label
            : schemaRef.translations.lockGroup?.label
        "
        :title="
          rg.disabled
            ? schemaRef.translations.lockGroupDisabled?.title
            : schemaRef.translations.lockGroup?.title
        "
        :disabled="rg.disabled"
        :action-class="rg.classNames.lockGroup"
        @click="toggleLockGroup"
      />

      <!-- MuteGroupAction -->
      <ActionElement
        v-if="schemaRef.showMuteButtons"
        :label="
          rg.ruleGroup.muted
            ? schemaRef.translations.unmuteGroup?.label
            : schemaRef.translations.muteGroup?.label
        "
        :title="
          rg.ruleGroup.muted
            ? schemaRef.translations.unmuteGroup?.title
            : schemaRef.translations.muteGroup?.title
        "
        :disabled="rg.disabled"
        :action-class="rg.classNames.muteGroup"
        @click="toggleMuteGroup"
      />

      <!-- RemoveGroupAction -->
      <ActionElement
        v-if="props.path.length > 0"
        :label="schemaRef.translations.removeGroup?.label"
        :title="schemaRef.translations.removeGroup?.title"
        :disabled="rg.disabled"
        :action-class="rg.classNames.removeGroup"
        @click="removeGroup"
      />
    </div>

    <!-- Body -->
    <div :class="rg.classNames.body">
      <template
        v-for="(r, idx) in rg.ruleGroup.rules"
        :key="typeof r === 'string' ? [...rg.pathsMemo[idx].path, r].join('-') : (r as RuleType | RuleGroupTypeAny).id"
      >
        <!-- InlineCombinator (between rules, when showCombinatorsBetweenRules) -->
        <InlineCombinator
          v-if="
            idx > 0 &&
            !schemaRef.independentCombinators &&
            schemaRef.showCombinatorsBetweenRules
          "
          :model-value="rg.combinator"
          :options="schemaRef.combinators"
          :title="schemaRef.translations.combinators?.title"
          :disabled="rg.disabled"
          @update:model-value="rg.onCombinatorChange"
        />

        <!-- Independent Combinator (when independentCombinators mode) -->
        <InlineCombinator
          v-if="typeof r === 'string'"
          :model-value="r"
          :options="schemaRef.combinators"
          :title="schemaRef.translations.combinators?.title"
          :disabled="rg.pathsMemo[idx].disabled || (typeof r !== 'string' && (r as RuleType | RuleGroupTypeAny).disabled)"
          @update:model-value="(val) => rg.onIndependentCombinatorChange(val, idx)"
        />

        <!-- RuleGroup (recursive) -->
        <component
          :is="RuleGroupRecursive"
          v-else-if="isRuleGroup(r)"
          :id="(r as RuleGroupTypeAny).id"
          :path="rg.pathsMemo[idx].path"
          :rule-group="r as RuleGroupTypeAny"
          :disabled="rg.pathsMemo[idx].disabled || (r as RuleGroupTypeAny).disabled"
          :parent-disabled="rg.disabled || props.parentDisabled"
          :parent-muted="rg.muted || props.parentMuted"
          :shift-up-disabled="pathsAreEqual([0], rg.pathsMemo[idx].path)"
          :shift-down-disabled="props.path.length === 0 && idx === rg.ruleGroup.rules.length - 1"
          :context="props.context"
        />

        <!-- Rule -->
        <component
          :is="Rule"
          v-else
          :id="(r as RuleType).id"
          :path="rg.pathsMemo[idx].path"
          :rule="r as RuleType"
          :disabled="rg.pathsMemo[idx].disabled || (r as RuleType).disabled"
          :parent-disabled="rg.disabled || props.parentDisabled"
          :parent-muted="rg.muted || props.parentMuted"
          :shift-up-disabled="pathsAreEqual([0], rg.pathsMemo[idx].path)"
          :shift-down-disabled="props.path.length === 0 && idx === rg.ruleGroup.rules.length - 1"
          :context="props.context"
        />
      </template>
    </div>
  </div>
</template>
