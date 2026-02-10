<script setup lang="ts">
import { type ComputedRef, type Ref, computed, inject, reactive } from 'vue';
import { useRule, type UseRule, type UseRuleProps } from '../composables/useRule';
import { useDeprecatedProps } from '../composables/useDeprecatedProps';
import {
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  lc,
  isPojo,
} from '@react-querybuilder/core';
import ShiftActions from './ShiftActions.vue';
import DragHandle from './DragHandle.vue';
import ValueSelector from './ValueSelector.vue';
import ValueEditor from './ValueEditor.vue';
import ActionElement from './ActionElement.vue';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { useRuleDnD } from '../composables/useRuleDnD';
import MatchModeEditor from './MatchModeEditor.vue';
import SubQueryWrapper from './SubQueryWrapper.vue';

type UnwrapRefs<T> = { [K in keyof T]: T[K] extends Ref<infer V> ? V : T[K] extends ComputedRef<infer V> ? V : T[K] };

const props = defineProps<Omit<UseRuleProps, 'schema'>>();

const schemaRef = inject(QUERY_BUILDER_CONTEXT_KEY);
if (!schemaRef) {
  throw new Error('Rule must be used within QueryBuilder');
}

useDeprecatedProps('rule', !props.rule);

const rRef = useRule({
  ...props,
  schema: schemaRef,
} as UseRuleProps);

/** reactive 包装后，模板中访问属性时 Vue 会自动解包 ref，无需手动 toValue */
const r = reactive(rRef) as UnwrapRefs<UseRule>;

const dnd = useRuleDnD({
  path: props.path,
  rule: props.rule,
  schema: schemaRef,
  disabled: rRef.disabled,
});

const stopPropagation = (fn: (event?: MouseEvent, context?: unknown) => void) => {
  return (event?: MouseEvent, context?: unknown) => {
    event?.stopPropagation();
    fn(event, context);
  };
};

const cloneRule = stopPropagation(rRef.cloneRule);
const toggleLockRule = stopPropagation(rRef.toggleLockRule);
const toggleMuteRule = stopPropagation(rRef.toggleMuteRule);
const removeRule = stopPropagation(rRef.removeRule);
const shiftRuleUp = stopPropagation(rRef.shiftRuleUp);
const shiftRuleDown = stopPropagation(rRef.shiftRuleDown);

const showFieldSelector = computed(() => {
  const schema = schemaRef!.value;
  return !(
    schema.fields.length === 1 &&
    isPojo(schema.fields[0]) &&
    'value' in schema.fields[0] &&
    (schema.fields[0] as { value?: string }).value === ''
  );
});

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

const hasSubQuery = computed(() => rRef.matchModes.value.length > 0);
const showOperatorSelector = computed(() => {
  const schema = schemaRef!.value;
  const fieldsPlaceholder = (schema.translations.fields as { placeholderName?: string } | undefined)?.placeholderName;
  return schema.autoSelectField || rRef.rule.value.field !== (fieldsPlaceholder ?? defaultPlaceholderFieldName);
});
const showValueEditor = computed(() => {
  const schema = schemaRef!.value;
  const operatorPlaceholder = (schema.translations.operators as { placeholderName?: string } | undefined)?.placeholderName ?? defaultPlaceholderOperatorName;
  return (
    (schema.autoSelectOperator || rRef.rule.value.operator !== operatorPlaceholder) &&
    !rRef.hideValueControls.value &&
    !['null', 'notnull'].includes(lc(`${rRef.rule.value.operator}`))
  );
});
const showValueSourceSelector = computed(() => {
  return (
    rRef.valueSources.value.length > 1 &&
    !['null', 'notnull'].includes(lc(`${rRef.rule.value.operator}`))
  );
});

</script>

<template>
  <div
    :ref="dnd.dropRef"
    :class="[r.outerClassName, dnd.isOver && 'query-builder-drag-over', dnd.dropNotAllowed && 'query-builder-drag-over-not-allowed']"
    data-testid="rule"
    :data-rule-id="props.id"
    :data-level="props.path.length"
    :data-path="JSON.stringify(props.path)"
  >
    <!-- ShiftActions -->
    <ShiftActions
      v-if="schemaRef.showShiftActions"
      :path="props.path"
      :disabled="r.disabled"
      :shift-up-disabled="props.shiftUpDisabled"
      :shift-down-disabled="props.shiftDownDisabled"
      :labels="shiftLabels"
      :titles="shiftTitles"
      @shift-up="shiftRuleUp"
      @shift-down="shiftRuleDown"
    />

    <!-- DragHandle (@vue-dnd-kit: dragRef 必须始终绑定到 DOM，否则 mounted 报 ElementRef is not set) -->
    <span
      v-show="schemaRef.enableDragAndDrop"
      :ref="dnd.dragRef"
      @pointerdown="dnd.handleDragStart"
    >
      <DragHandle
        v-if="schemaRef.enableDragAndDrop"
        :rule-or-group="r.rule"
        :path="props.path"
        :disabled="r.disabled"
        :title="schemaRef.translations.dragHandle?.title"
        :label="schemaRef.translations.dragHandle?.label"
      />
    </span>

    <!-- FieldSelector -->
    <ValueSelector
      v-if="showFieldSelector"
      :model-value="r.rule.field"
      :options="schemaRef.fields"
      :title="schemaRef.translations.fields?.title"
      :disabled="r.disabled"
      @update:model-value="r.onChangeField"
    />

    <!-- MatchModeEditor or OperatorSelector -->
    <template v-if="showOperatorSelector">
      <!-- MatchModeEditor (when has subquery) -->
      <MatchModeEditor
        v-if="hasSubQuery"
        :match="{ mode: (r.rule.match?.mode ?? 'all'), threshold: r.rule.match?.threshold ?? undefined }"
        :options="r.matchModes as import('@react-querybuilder/core').MatchModeOptions"
        :title="schemaRef.translations.matchMode?.title"
        :disabled="r.disabled"
        @update:match="(match) => r.onChangeMatchMode(match)"
      />

      <!-- OperatorSelector (when no subquery) -->
      <template v-else>
        <ValueSelector
          :model-value="r.rule.operator"
          :options="(r.operators as import('@react-querybuilder/core').FullOption[])"
          :title="schemaRef.translations.operators?.title"
          :disabled="r.disabled"
          @update:model-value="r.onChangeOperator"
        />

        <!-- ValueSourceSelector -->
        <ValueSelector
          v-if="showValueEditor && showValueSourceSelector"
          :model-value="r.rule.valueSource ?? 'value'"
          :options="(r.valueSourceOptions as import('@react-querybuilder/core').FullOption[])"
          :title="schemaRef.translations.valueSourceSelector?.title"
          :disabled="r.disabled"
          @update:model-value="r.onChangeValueSource"
        />

        <!-- ValueEditor -->
        <ValueEditor
          v-if="showValueEditor"
          :model-value="(r.rule.value as string | number | boolean | (string | null)[])"
          :operator="r.rule.operator"
          :value-editor-type="r.valueEditorType ?? 'text'"
          :input-type="r.inputType ?? null"
          :options="(r.values as import('@react-querybuilder/core').FullOption[])"
          :separator="r.valueEditorSeparator ?? undefined"
          :placeholder="(schemaRef.getValuePlaceholder?.(r.rule.field, r.rule.operator) ?? undefined) as string | undefined"
          :lists-as-arrays="schemaRef.listsAsArrays"
          :field-data="r.fieldData"
          :parse-numbers="schemaRef.parseNumbers"
          :value-source="r.rule.valueSource"
          :disabled="r.disabled"
          @update:model-value="r.onChangeValue"
        />
      </template>
    </template>

    <!-- SubQueryWrapper (when has subquery，与 plan 5.2 对齐) -->
    <template v-if="hasSubQuery && r.rule.value && typeof r.rule.value === 'object' && 'rules' in r.rule.value">
      <SubQueryWrapper
        :subquery-value="r.rule.value"
        :parent-context="schemaRef"
        :disabled="r.disabled"
        :enable-mount-query-change="schemaRef.enableMountQueryChange"
        :on-subquery-change="(q) => r.onChangeValue(q)"
      />
    </template>

    <!-- CloneRuleAction -->
    <ActionElement
      v-if="schemaRef.showCloneButtons"
      :label="schemaRef.translations.cloneRule?.label"
      :title="schemaRef.translations.cloneRule?.title"
      :disabled="r.disabled"
      :action-class="r.classNames.cloneRule"
      @click="cloneRule"
    />

    <!-- LockRuleAction (lockRule / lockRuleDisabled 与 plan 对齐) -->
    <ActionElement
      v-if="schemaRef.showLockButtons"
      :label="r.disabled ? schemaRef.translations.lockRuleDisabled?.label : schemaRef.translations.lockRule?.label"
      :title="r.disabled ? schemaRef.translations.lockRuleDisabled?.title : schemaRef.translations.lockRule?.title"
      :disabled="r.disabled"
      :action-class="r.classNames.lockRule"
      @click="toggleLockRule"
    />

    <!-- MuteRuleAction -->
    <ActionElement
      v-if="schemaRef.showMuteButtons"
      :label="r.rule.muted ? schemaRef.translations.unmuteRule?.label : schemaRef.translations.muteRule?.label"
      :title="r.rule.muted ? schemaRef.translations.unmuteRule?.title : schemaRef.translations.muteRule?.title"
      :disabled="r.disabled"
      :action-class="r.classNames.muteRule"
      @click="toggleMuteRule"
    />

    <!-- RemoveRuleAction -->
    <ActionElement
      :label="schemaRef.translations.removeRule?.label"
      :title="schemaRef.translations.removeRule?.title"
      :disabled="r.disabled"
      :action-class="r.classNames.removeRule"
      @click="removeRule"
    />
  </div>
</template>
