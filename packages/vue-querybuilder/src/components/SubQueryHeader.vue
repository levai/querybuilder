<script setup lang="ts">
import type { Component } from 'vue';
import { computed, inject } from 'vue';
import { rootPath } from '@react-querybuilder/core';
import { TestID } from '@react-querybuilder/core';
import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { useRuleGroup } from '../composables/useRuleGroup';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import ValueSelector from './ValueSelector.vue';
import NotToggle from './NotToggle.vue';
import ActionElement from './ActionElement.vue';

const defaultControls = {
  combinatorSelector: ValueSelector,
  notToggle: NotToggle,
  actionElement: ActionElement,
};

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    parentDisabled?: boolean;
  }>(),
  { disabled: false, parentDisabled: false }
);

const r = useRuleGroup({
  path: rootPath,
  disabled: props.disabled,
  parentDisabled: props.parentDisabled,
  parentMuted: false,
  shiftUpDisabled: true,
  shiftDownDisabled: true,
});

const ctx = inject(QUERY_BUILDER_CONTEXT_KEY);
const schemaVal = computed(() => (ctx?.value as { schema?: { value?: { showNotToggle?: boolean; controls?: unknown; combinators?: unknown[] } } })?.schema?.value);
const translationsVal = computed(() => (ctx?.value as { translations?: { value?: Record<string, unknown> } })?.translations?.value ?? {});

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}
const classNamesVal = computed(() => (unwrapRef(r.classNames) ?? {}) as Record<string, string>);
const disabledVal = computed(() => !!unwrapRef(r.disabled));
const parentDisabledVal = computed(() => !!unwrapRef(r.parentDisabled));
const combinatorVal = computed(() => (unwrapRef(r.combinator) ?? '') as string);
const ruleGroupVal = computed(() => unwrapRef(r.ruleGroup) as RuleGroupTypeAny | null);
const schemaUnwrapped = computed(() => {
  const s = (r.schema as { value?: { combinators?: unknown[]; showLockButtons?: boolean; controls?: { ruleGroup?: unknown } } })?.value ?? r.schema;
  return s ?? {};
});
const schemaValForControls = computed(() => schemaUnwrapped.value as { combinators?: unknown[]; showLockButtons?: boolean; showCloneButtons?: boolean; showMuteButtons?: boolean } | undefined);
const combinatorsList = computed(() => (schemaValForControls.value?.combinators ?? []) as { name: string; label: string }[]);
const showLockButtonsVal = computed(() => !!schemaValForControls.value?.showLockButtons);
const showCloneButtonsVal = computed(() => !!schemaValForControls.value?.showCloneButtons && false);
const showMuteButtonsVal = computed(() => !!schemaValForControls.value?.showMuteButtons);

const combinatorTitle = computed(() => (translationsVal.value?.combinators as { title?: string })?.title ?? '');
const addRuleLabel = computed(() => (translationsVal.value?.addRule as { label?: string })?.label ?? '');
const addRuleTitle = computed(() => (translationsVal.value?.addRule as { title?: string })?.title ?? '');
const addGroupLabel = computed(() => (translationsVal.value?.addGroup as { label?: string })?.label ?? '');
const addGroupTitle = computed(() => (translationsVal.value?.addGroup as { title?: string })?.title ?? '');
const lockLabel = computed(() => (disabledVal.value ? (translationsVal.value?.lockGroupDisabled as { label?: string })?.label : (translationsVal.value?.lockGroup as { label?: string })?.label) ?? '');
const lockTitle = computed(() => (disabledVal.value ? (translationsVal.value?.lockGroupDisabled as { title?: string })?.title : (translationsVal.value?.lockGroup as { title?: string })?.title) ?? '');
const cloneGroupLabel = computed(() => (translationsVal.value?.cloneRuleGroup as { label?: string })?.label ?? '⧉');
const cloneGroupTitle = computed(() => (translationsVal.value?.cloneRuleGroup as { title?: string })?.title ?? 'Clone group');
const muteGroupLabel = computed(() => ((translationsVal.value?.muteGroup as { label?: string })?.label ?? ''));
const muteGroupTitle = computed(() => ((translationsVal.value?.muteGroup as { title?: string })?.title ?? ''));
const notToggleLabel = computed(() => (translationsVal.value?.notToggle as { label?: string })?.label ?? 'Not');
const notToggleTitle = computed(() => (translationsVal.value?.notToggle as { title?: string })?.title ?? 'Invert this group');

/** 从 schema.controls 取组件，未提供时用默认组件（与 RuleGroupHeaderComponents 一致） */
const controls = computed(() => {
  const c = (schemaVal.value as { controls?: Record<string, Component> } | undefined)?.controls;
  if (!c) return defaultControls;
  return {
    combinatorSelector: (c.combinatorSelector as Component) ?? defaultControls.combinatorSelector,
    notToggle: (c.notToggle as Component) ?? defaultControls.notToggle,
    actionElement: (c.actionElement as Component) ?? defaultControls.actionElement,
  };
});
</script>

<template>
  <div :class="classNamesVal.header">
    <component
      :is="controls.combinatorSelector"
      v-if="combinatorVal !== undefined"
      :value="combinatorVal"
      :options="combinatorsList"
      :test-id="TestID.combinators"
      :title="combinatorTitle"
      :class-name="classNamesVal.combinators"
      :disabled="disabledVal"
      :handle-on-change="(v: string | string[]) => r.onCombinatorChange(Array.isArray(v) ? v[0] : v)"
    />
    <component
      v-if="schemaVal?.showNotToggle"
      :is="controls.notToggle"
      :test-id="TestID.notToggle"
      :checked="!!ruleGroupVal?.not"
      :class-name="classNamesVal.notToggle"
      :disabled="disabledVal"
      :label="notToggleLabel"
      :title="notToggleTitle"
      :handle-on-change="r.onNotToggleChange"
    />
    <component
      :is="controls.actionElement"
      :test-id="TestID.addRule"
      :label="addRuleLabel"
      :title="addRuleTitle"
      :disabled="disabledVal"
      :class-name="classNamesVal.addRule"
      :handle-on-click="r.addRule"
    />
    <component
      :is="controls.actionElement"
      :test-id="TestID.addGroup"
      :label="addGroupLabel"
      :title="addGroupTitle"
      :disabled="disabledVal"
      :class-name="classNamesVal.addGroup"
      :handle-on-click="r.addGroup"
    />
    <component
      v-if="showCloneButtonsVal"
      :is="controls.actionElement"
      :test-id="TestID.cloneGroup"
      :label="cloneGroupLabel"
      :title="cloneGroupTitle"
      :disabled="disabledVal"
      :class-name="classNamesVal.cloneGroup"
      :handle-on-click="r.cloneGroup"
    />
    <component
      v-if="showLockButtonsVal"
      :is="controls.actionElement"
      :test-id="TestID.lockGroup"
      :label="lockLabel"
      :title="lockTitle"
      :rule-or-group="ruleGroupVal"
      :disabled="parentDisabledVal"
      :class-name="classNamesVal.lockGroup"
      :handle-on-click="r.toggleLockGroup"
    />
    <component
      v-if="showMuteButtonsVal"
      :is="controls.actionElement"
      :test-id="TestID.muteGroup"
      :label="muteGroupLabel"
      :title="muteGroupTitle"
      :rule-or-group="ruleGroupVal"
      :disabled="disabledVal"
      :class-name="classNamesVal.muteGroup"
      :handle-on-click="r.toggleMuteGroup"
    />
  </div>
</template>
