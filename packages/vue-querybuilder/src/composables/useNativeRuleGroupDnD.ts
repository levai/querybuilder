/**
 * Native HTML5 DnD: RuleGroup as drag source and drop target.
 */
import type { DraggedItem, DropResult, Path, RuleGroupTypeAny } from '@react-querybuilder/core';
import type { Schema } from '../types';
import { findPath, getParentPath, isAncestor, isRuleGroup, pathsAreEqual } from '@react-querybuilder/core';
import { computed, inject, ref } from 'vue';
import type { Ref } from 'vue';
import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import {
  DND_CONFIG_KEY,
  DND_DRAGGED_ITEM_KEY,
  DND_LAST_DROP_RESULT_KEY,
  QUERY_BUILDER_CONTEXT_KEY,
} from '../context/queryBuilderContext';
import { applyDrop } from '../utils/applyDrop';
import { getEmptyImage } from '../utils/getEmptyImage';
import { isHotkeyPressed } from '../utils/isHotkeyPressed';

export interface UseNativeRuleGroupDnDOptions {
  path: MaybeRefOrGetter<Path>;
  ruleGroup: MaybeRefOrGetter<RuleGroupTypeAny | null>;
  disabled: MaybeRefOrGetter<boolean>;
}

export interface UseNativeRuleGroupDnDReturn {
  dropRef: Ref<HTMLElement | null>;
  dragHandleRef: Ref<HTMLElement | null>;
  isDragging: Ref<boolean>;
  isOver: Ref<boolean>;
  dropNotAllowed: Ref<boolean>;
  dropEffect: Ref<'move' | 'copy'>;
  groupItems: Ref<boolean>;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  onDragover: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragleave: (e: DragEvent) => void;
}

function canDropRuleGroup(
  dragging: DraggedItem | null,
  path: Path,
  ruleGroup: RuleGroupTypeAny | null,
  qbId: string,
  disabled: boolean,
  customCanDrop?: (p: { dragging: DraggedItem; hovering: DraggedItem; groupItems?: boolean }) => boolean
): boolean {
  if (!dragging) return false;
  if (disabled) return false;
  const hovering = ruleGroup ? { ...ruleGroup, path, qbId } : null;
  if (hovering && typeof customCanDrop === 'function' && !customCanDrop({ dragging, hovering })) return false;
  if (qbId !== dragging.qbId) return true;

  const parentItemPath = getParentPath(dragging.path);
  const itemIndex = dragging.path.at(-1);

  if (isAncestor(dragging.path, path)) return false;
  if (pathsAreEqual(path, parentItemPath) && itemIndex === 0) return false;
  if (pathsAreEqual(path, dragging.path)) return false;
  return true;
}

export function useNativeRuleGroupDnD(options: UseNativeRuleGroupDnDOptions): UseNativeRuleGroupDnDReturn {
  const path = computed(() => toValue(options.path));
  const ruleGroup = computed(() => toValue(options.ruleGroup));
  const disabled = computed(() => toValue(options.disabled));
  const draggedItemRef = inject(DND_DRAGGED_ITEM_KEY);
  const lastDropResultRef = inject(DND_LAST_DROP_RESULT_KEY);
  const configRef = inject(DND_CONFIG_KEY);
  const contextRef = inject(QUERY_BUILDER_CONTEXT_KEY);
  if (!draggedItemRef || !lastDropResultRef || !configRef || !contextRef) {
    return {
      dropRef: ref(null),
      dragHandleRef: ref(null),
      isDragging: ref(false),
      isOver: ref(false),
      dropNotAllowed: ref(false),
      dropEffect: ref('move'),
      groupItems: ref(false),
      onDragStart: () => {},
      onDragEnd: () => {},
      onDragover: () => {},
      onDrop: () => {},
      onDragleave: () => {},
    };
  }

  const dropRef = ref<HTMLElement | null>(null);
  const dragHandleRef = ref<HTMLElement | null>(null);
  const isOverLocal = ref(false);
  const isOver = computed(() => isOverLocal.value && !!draggedItemRef?.value);
  const dropNotAllowed = ref(false);
  const isDragging = computed(
    () => (draggedItemRef?.value?.path && pathsAreEqual(draggedItemRef.value.path, path.value)) ?? false
  );

  const dropEffect = computed(() =>
    configRef.value && isHotkeyPressed(configRef.value.copyModeModifierKey) ? 'copy' : 'move'
  );
  const groupItems = computed(() =>
    configRef.value && isHotkeyPressed(configRef.value.groupModeModifierKey)
  );

  function buildDropResult(): DropResult | null {
    const ctx = contextRef?.value;
    const schema: Schema | undefined = (ctx?.schema as Ref<Schema> | undefined)?.value;
    if (!schema?.getQuery || !schema?.dispatchQuery) return null;
    return {
      type: 'ruleGroup',
      path: path.value,
      qbId: schema.qbId,
      getQuery: schema.getQuery,
      dispatchQuery: schema.dispatchQuery,
      dropEffect: configRef?.value && isHotkeyPressed(configRef.value.copyModeModifierKey) ? 'copy' : 'move',
      groupItems: configRef?.value && isHotkeyPressed(configRef.value.groupModeModifierKey),
    };
  }

  function onDragover(e: DragEvent) {
    const dragged = draggedItemRef?.value ?? null;
    const config = configRef?.value;
    const ctx = contextRef?.value;
    const schema: Schema | undefined = (ctx?.schema as Ref<Schema> | undefined)?.value;
    if (!schema || !config) return;

    const allowed = canDropRuleGroup(dragged, path.value, ruleGroup.value, schema.qbId, disabled.value, config.canDrop);
    if (allowed) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = config && isHotkeyPressed(config?.copyModeModifierKey ?? '') ? 'copy' : 'move';
      isOverLocal.value = true;
      dropNotAllowed.value = false;
    } else {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      dropNotAllowed.value = !!dragged;
      isOverLocal.value = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const allowed = canDropRuleGroup(
      draggedItemRef?.value ?? null,
      path.value,
      ruleGroup.value,
      (contextRef?.value?.schema as Ref<Schema> | undefined)?.value?.qbId ?? '',
      disabled.value,
      configRef?.value?.canDrop
    );
    if (!allowed || !lastDropResultRef) return;
    const result = buildDropResult();
    if (result) lastDropResultRef.value = result;
    isOverLocal.value = false;
    dropNotAllowed.value = false;
  }

  function onDragleave() {
    isOverLocal.value = false;
    dropNotAllowed.value = false;
  }

  function onDragStart(e: DragEvent) {
    if (disabled.value) return;
    const ctx = contextRef?.value;
    const schema: Schema | undefined = (ctx?.schema as Ref<Schema> | undefined)?.value;
    if (!schema?.getQuery || !draggedItemRef) return;
    const query = schema.getQuery();
    const node = findPath(path.value, query);
    if (!node || !isRuleGroup(node)) return;
    const item: DraggedItem = { ...node, path: path.value, qbId: schema.qbId };
    draggedItemRef.value = item;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = configRef?.value && isHotkeyPressed(configRef.value.copyModeModifierKey) ? 'copy' : 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'ruleGroup', path: path.value, qbId: schema.qbId }));
      if (configRef?.value?.hideDefaultDragPreview) {
        e.dataTransfer.setDragImage(getEmptyImage(), 0, 0);
      }
    }
  }

  function onDragEnd() {
    const result = lastDropResultRef?.value;
    const item = draggedItemRef?.value;
    const actions = (contextRef?.value?.actions as { value?: { moveRule: unknown; groupRule: unknown; onRuleRemove: unknown } })?.value;
    if (result && item && actions) {
      applyDrop(item, result, {
        moveRule: actions.moveRule as (a: Path, b: Path | 'up' | 'down', c?: boolean) => void,
        groupRule: actions.groupRule as (a: Path, b: Path, c?: boolean) => void,
        onRuleRemove: actions.onRuleRemove as (p: Path) => void,
      });
    }
    if (lastDropResultRef) lastDropResultRef.value = null;
    if (draggedItemRef) draggedItemRef.value = null;
  }

  return {
    dropRef,
    dragHandleRef,
    isDragging,
    isOver,
    dropNotAllowed,
    dropEffect,
    groupItems,
    onDragStart,
    onDragEnd,
    onDragover,
    onDrop,
    onDragleave,
  };
}
