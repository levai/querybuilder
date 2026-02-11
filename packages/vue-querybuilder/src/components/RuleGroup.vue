<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRuleGroup, type UseRuleGroupProps } from '../composables/useRuleGroup';
import { useDeprecatedProps } from '../composables/useDeprecatedProps';
import { isRuleGroup, pathsAreEqual } from '@react-querybuilder/core';
import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import type { Schema } from '../types';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import CombinatorSelector from './CombinatorSelector.vue';
import NotToggle from './NotToggle.vue';
import ActionElement from './ActionElement.vue';
import InlineCombinator from './InlineCombinator.vue';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { useRuleGroupDnD } from '../composables/useRuleGroupDnD';
import RuleGroupRecursive from './RuleGroup.vue';
import Rule from './Rule.vue';

const props = defineProps<Omit<UseRuleGroupProps, 'schema'>>();

// Define isDev for template use (Vite uses import.meta.env.DEV)
const isDev = import.meta.env.DEV;

// Debug: log props
if (isDev) {
  console.log('RuleGroup component mounted', {
    hasProps: !!props,
    hasRuleGroup: !!props.ruleGroup,
    ruleGroupId: props.ruleGroup?.id,
    ruleGroupRules: props.ruleGroup?.rules?.length ?? 0,
    path: props.path,
    hasTranslations: !!props.translations,
    hasActions: !!props.actions,
  });
}

const schemaRef = inject(QUERY_BUILDER_CONTEXT_KEY);
if (!schemaRef) {
  console.error('RuleGroup: schemaRef not found from inject');
  throw new Error('RuleGroup must be used within QueryBuilder');
}

// Extract schema from context
// schemaRef is Ref<QueryBuilderContextType>, and contextValue.schema should be Ref<Schema>
// But Vue may auto-unwrap nested refs, so we need to check if it's already unwrapped
const schema = computed(() => {
  const contextValue = schemaRef.value;
  if (import.meta.env.DEV) {
    console.log('RuleGroup: contextValue', {
      hasContextValue: !!contextValue,
      contextValueKeys: contextValue ? Object.keys(contextValue) : [],
      hasSchema: !!contextValue?.schema,
      schemaType: typeof contextValue?.schema,
      schemaIsRef: contextValue?.schema && typeof contextValue.schema === 'object' && 'value' in contextValue.schema,
      schemaValueDirect: (contextValue?.schema as any)?.value,
      schemaDirect: contextValue?.schema,
    });
  }
  if (!contextValue) {
    console.error('Context value is undefined', { schemaRef });
    throw new Error('Context value is undefined');
  }
  if (!contextValue.schema) {
    console.error('Schema not found in QueryBuilder context', {
      contextValue,
      contextValueKeys: Object.keys(contextValue),
      schemaRef: schemaRef.value,
    });
    throw new Error('Schema not found in QueryBuilder context');
  }
  
  // contextValue.schema is a computed ref, access its value
  // If it has a 'value' property, it's a Ref/ComputedRef, access .value
  let schemaValue: any;
  if (contextValue.schema && typeof contextValue.schema === 'object' && 'value' in contextValue.schema) {
    // It's a Ref<Schema> or ComputedRef<Schema>, access .value
    schemaValue = (contextValue.schema as any).value;
  } else {
    // Already unwrapped or direct value
    schemaValue = contextValue.schema;
  }
  
  if (import.meta.env.DEV) {
    console.log('RuleGroup schema extracted', {
      hasSchema: !!schemaValue,
      hasControls: !!schemaValue?.controls,
      hasRuleGroupControl: !!schemaValue?.controls?.ruleGroup,
      hasFields: !!schemaValue?.fields,
      fieldsCount: Array.isArray(schemaValue?.fields) ? schemaValue.fields.length : 0,
      qbId: schemaValue?.qbId,
    });
  }
  if (!schemaValue) {
    console.error('Schema value is undefined', {
      contextValue,
      schemaRef: schemaRef.value,
      contextValueSchema: contextValue.schema,
      schemaValue,
    });
    throw new Error('Schema value is undefined');
  }
  return schemaValue;
});

useDeprecatedProps('ruleGroup', !props.ruleGroup);

// ✅ Vue3 规范：直接调用 useRuleGroup，它内部已经处理了响应式
const {
  disabled,
  muted,
  combinator,
  outerClassName,
  classNames,
  pathsMemo,
  accessibleDescription,
  onCombinatorChange,
  onNotToggleChange,
  onIndependentCombinatorChange,
  addRule: addRuleFn,
  addGroup: addGroupFn,
  cloneGroup: cloneGroupFn,
  toggleLockGroup: toggleLockGroupFn,
  toggleMuteGroup: toggleMuteGroupFn,
  removeGroup: removeGroupFn,
  shiftGroupUp: shiftGroupUpFn,
  shiftGroupDown: shiftGroupDownFn,
} = useRuleGroup({
  ...props,
  schema: schema.value,
} as UseRuleGroupProps);

const dnd = useRuleGroupDnD({
  path: props.path,
  ruleGroup: props.ruleGroup,
  schema: schema,
  disabled: disabled ?? false,
});

// ✅ Vue3 规范：事件处理函数直接定义，使用 stopPropagation 包装
const stopPropagation = (fn: (event?: MouseEvent, context?: unknown) => void) => {
  return (event?: MouseEvent, context?: unknown) => {
    event?.stopPropagation();
    fn(event, context);
  };
};

const addRule = stopPropagation(addRuleFn);
const addGroup = stopPropagation(addGroupFn);
const cloneGroup = stopPropagation(cloneGroupFn);
const toggleLockGroup = stopPropagation(toggleLockGroupFn);
const toggleMuteGroup = stopPropagation(toggleMuteGroupFn);
const removeGroup = stopPropagation(removeGroupFn);
const shiftGroupUp = stopPropagation(shiftGroupUpFn);
const shiftGroupDown = stopPropagation(shiftGroupDownFn);

const shiftTitles = computed(() => {
  const s = schema.value;
  return s.showShiftActions
    ? {
        shiftUp: props.translations.shiftActionUp?.title,
        shiftDown: props.translations.shiftActionDown?.title,
      }
    : undefined;
});

const shiftLabels = computed(() => {
  const s = schema.value;
  return s.showShiftActions
    ? {
        shiftUp: props.translations.shiftActionUp?.label,
        shiftDown: props.translations.shiftActionDown?.label,
      }
    : undefined;
});

</script>

<template  >
    <div
    :ref="dnd.dropRef"
    :title="accessibleDescription"
    :class="[outerClassName, dnd.isOver && 'query-builder-drag-over', dnd.dropNotAllowed && 'query-builder-drag-over-not-allowed']"
    data-testid="rule-group"
    :data-not="props.ruleGroup?.not ? 'true' : undefined"
    :data-rule-group-id="props.id"
    :data-level="props.path.length"
    :data-path="JSON.stringify(props.path)"
  >
    <!-- Header -->
    <div :class="classNames.header">
      <!-- ShiftActions -->
      <ShiftActions
        v-if="schema.showShiftActions && props.path.length > 0"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :disabled="disabled"
        :labels="shiftLabels"
        :titles="shiftTitles"
        :shift-up-disabled="props.shiftUpDisabled"
        :shift-down-disabled="props.shiftDownDisabled"
        @shift-up="shiftGroupUp"
        @shift-down="shiftGroupDown"
      />

      <!-- DragHandle (@vue-dnd-kit: dragRef 必须始终绑定到 DOM，否则 mounted 报 ElementRef is not set) -->
      <span
        v-show="props.path.length > 0 && schema.enableDragAndDrop"
        :ref="dnd.dragRef"
        @pointerdown="dnd.handleDragStart"
      >
        <DragHandle
          v-if="props.path.length > 0 && schema.enableDragAndDrop"
          :rule-or-group="props.ruleGroup"
          :path="props.path"
          :level="props.path.length"
          :schema="schema"
          :disabled="disabled"
          :title="props.translations.dragHandle?.title"
          :label="props.translations.dragHandle?.label"
        />
      </span>

      <!-- CombinatorSelector -->
      <CombinatorSelector
        v-if="!schema.showCombinatorsBetweenRules && !schema.independentCombinators"
        :value="combinator"
        :options="schema.combinators"
        :rules="props.ruleGroup?.rules ?? []"
        :rule-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :title="props.translations.combinators?.title"
        :disabled="disabled"
        :handle-on-change="onCombinatorChange"
      />

      <!-- NotToggle -->
      <NotToggle
        v-if="schema.showNotToggle"
        :checked="!!props.ruleGroup?.not"
        :rule-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="props.translations.notToggle?.label"
        :title="props.translations.notToggle?.title"
        :disabled="disabled"
        :handle-on-change="onNotToggleChange"
      />

      <!-- AddRuleAction -->
      <ActionElement
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="props.translations.addRule?.label"
        :title="props.translations.addRule?.title"
        :disabled="disabled"
        :action-class="classNames.addRule"
        :handle-on-click="addRule"
      />

      <!-- AddGroupAction -->
      <ActionElement
        v-if="schema.maxLevels && schema.maxLevels > props.path.length"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="props.translations.addGroup?.label"
        :title="props.translations.addGroup?.title"
        :disabled="disabled"
        :action-class="classNames.addGroup"
        :handle-on-click="addGroup"
      />

      <!-- CloneGroupAction -->
      <ActionElement
        v-if="schema.showCloneButtons && props.path.length > 0"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="props.translations.cloneRuleGroup?.label"
        :title="props.translations.cloneRuleGroup?.title"
        :disabled="disabled"
        :action-class="classNames.cloneGroup"
        :handle-on-click="cloneGroup"
      />
      <template v-if="isDev">
        <div v-if="schema.showCloneButtons && props.path.length > 0" style="display: none;">
          [DEBUG] CloneGroupAction should render: schema.showCloneButtons={{ schema.showCloneButtons }}, path.length={{ props.path.length }}
        </div>
      </template>

      <!-- LockGroupAction -->
      <ActionElement
        v-if="schema.showLockButtons"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="
          disabled
            ? props.translations.lockGroupDisabled?.label
            : props.translations.lockGroup?.label
        "
        :title="
          disabled
            ? props.translations.lockGroupDisabled?.title
            : props.translations.lockGroup?.title
        "
        :disabled="disabled"
        :action-class="classNames.lockGroup"
        :handle-on-click="toggleLockGroup"
      />
      <template v-if="isDev">
        <div v-if="schema.showLockButtons" style="display: none;">
          [DEBUG] LockGroupAction should render: schema.showLockButtons={{ schema.showLockButtons }}
        </div>
      </template>

      <!-- MuteGroupAction -->
      <ActionElement
        v-if="schema.showMuteButtons"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="
          props.ruleGroup?.muted
            ? props.translations.unmuteGroup?.label
            : props.translations.muteGroup?.label
        "
        :title="
          props.ruleGroup?.muted
            ? props.translations.unmuteGroup?.title
            : props.translations.muteGroup?.title
        "
        :disabled="disabled"
        :action-class="classNames.muteGroup"
        :handle-on-click="toggleMuteGroup"
      />
      <template v-if="isDev">
        <div v-if="schema.showMuteButtons" style="display: none;">
          [DEBUG] MuteGroupAction should render: schema.showMuteButtons={{ schema.showMuteButtons }}
        </div>
      </template>

      <!-- RemoveGroupAction -->
      <ActionElement
        v-if="props.path.length > 0"
        :rule-or-group="props.ruleGroup"
        :path="props.path"
        :level="props.path.length"
        :schema="schema"
        :label="props.translations.removeGroup?.label"
        :title="props.translations.removeGroup?.title"
        :disabled="disabled"
        :action-class="classNames.removeGroup"
        :handle-on-click="removeGroup"
      />
    </div>

    <div :class="classNames.body">
      <!-- ✅ 与 React 版本对齐：使用 pathsMemo 计算的 path 作为 key -->
      <template
        v-for="(r, idx) in (props.ruleGroup?.rules ?? [])"
        :key="typeof r === 'string' ? [...(pathsMemo[idx]?.path ?? [...props.path, idx]), r].join('-') : (r as RuleType | RuleGroupTypeAny).id"
      >
        <!-- InlineCombinator (between rules, when showCombinatorsBetweenRules) -->
        <InlineCombinator
          v-if="
            idx > 0 &&
            !schema.independentCombinators &&
            schema.showCombinatorsBetweenRules
          "
          :component="schema.controls.combinatorSelector"
          :model-value="combinator"
          :options="schema.combinators"
          :rules="props.ruleGroup?.rules ?? []"
          :rule-group="props.ruleGroup"
          :path="props.path"
          :level="props.path.length"
          :schema="schema"
          :title="props.translations.combinators?.title"
          :disabled="disabled"
          :handle-on-change="onCombinatorChange"
        />

        <!-- Independent Combinator (when independentCombinators mode) -->
        <!-- ✅ 与 React 版本对齐：使用 pathsMemo 获取 path 和 disabled -->
        <InlineCombinator
          v-if="typeof r === 'string'"
          :component="schema.controls.combinatorSelector"
          :model-value="r"
          :options="schema.combinators"
          :rules="props.ruleGroup?.rules ?? []"
          :rule-group="props.ruleGroup"
          :path="pathsMemo[idx]?.path ?? [...props.path, idx]"
          :level="(pathsMemo[idx]?.path ?? [...props.path, idx]).length"
          :schema="schema"
          :title="props.translations.combinators?.title"
          :disabled="pathsMemo[idx]?.disabled ?? false"
          :handle-on-change="(val: string) => onIndependentCombinatorChange(val, idx)"
        />

        <!-- RuleGroup (递归：直接自引用，保证 props 响应) -->
        <!-- ✅ 与 React 版本对齐：使用 pathsMemo 获取 path 和 disabled -->
        <RuleGroupRecursive
          v-else-if="isRuleGroup(r)"
          :id="(r as RuleGroupTypeAny).id"
          :path="pathsMemo[idx]?.path ?? [...props.path, idx]"
          :rule-group="r as RuleGroupTypeAny"
          :translations="props.translations"
          :schema="schema"
          :actions="props.actions"
          :disabled="pathsMemo[idx]?.disabled || (r as RuleGroupTypeAny).disabled"
          :parent-disabled="props.parentDisabled || disabled"
          :parent-muted="props.parentMuted || muted"
          :shift-up-disabled="pathsAreEqual([0], pathsMemo[idx]?.path ?? [])"
          :shift-down-disabled="props.path.length === 0 && idx === (props.ruleGroup?.rules?.length ?? 0) - 1"
          :context="props.context"
        />

        <!-- Rule -->
        <!-- ✅ 与 React 版本对齐：使用 pathsMemo 获取 path 和 disabled -->
        <Rule
          v-else
          :id="(r as RuleType).id"
          :path="pathsMemo[idx]?.path ?? [...props.path, idx]"
          :rule="r as RuleType"
          :translations="props.translations"
          :schema="schema"
          :actions="props.actions"
          :disabled="pathsMemo[idx]?.disabled || (r as RuleType).disabled"
          :parent-disabled="props.parentDisabled || disabled"
          :parent-muted="props.parentMuted || muted"
          :shift-up-disabled="pathsAreEqual([0], pathsMemo[idx]?.path ?? [])"
          :shift-down-disabled="props.path.length === 0 && idx === (props.ruleGroup?.rules?.length ?? 0) - 1"
          :context="props.context"
        />
      </template>
    </div>
  </div>
</template>
