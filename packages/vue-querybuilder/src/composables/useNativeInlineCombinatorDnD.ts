/**
 * Native HTML5 DnD: InlineCombinator as drop target (insert between two rules).
 */
import type {
  DraggedItem,
  DropResult,
  Path,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import type { Schema } from '../types';
import { getParentPath, isAncestor, pathsAreEqual } from '@react-querybuilder/core';
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
import { isHotkeyPressed } from '../utils/isHotkeyPressed';

export interface UseNativeInlineCombinatorDnDOptions {
  path: MaybeRefOrGetter<Path>;
  /** Parent group's rules array (for standard or IC) to get hovering item: rules[path.at(-1)! - 1] */
  rules: MaybeRefOrGetter<Array<RuleType | RuleGroupTypeAny | string>>;
}

export interface UseNativeInlineCombinatorDnDReturn {
  dropRef: Ref<HTMLElement | null>;
  isOver: Ref<boolean>;
  dropNotAllowed: Ref<boolean>;
  dropEffect: Ref<'move' | 'copy'>;
  groupItems: Ref<boolean>;
  onDragover: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragleave: (e: DragEvent) => void;
}

function canDropInlineCombinator(
  dragging: DraggedItem | null,
  path: Path,
  hoveringItem: RuleType | RuleGroupTypeAny | null,
  qbId: string,
  independentCombinators: boolean,
  groupModeModifierKey: string,
  customCanDrop?: (p: { dragging: DraggedItem; hovering: DraggedItem; groupItems?: boolean }) => boolean
): boolean {
  if (!dragging) return false;
  if (isHotkeyPressed(groupModeModifierKey)) return false;
  const hovering = hoveringItem ? { ...hoveringItem, path, qbId } : null;
  if (hovering && typeof customCanDrop === 'function' && !customCanDrop({ dragging, hovering })) return false;

  const parentHoverPath = getParentPath(path);
  const parentItemPath = getParentPath(dragging.path);
  const hoverIndex = path.at(-1)!;
  const itemIndex = dragging.path.at(-1)!;

  if (isAncestor(dragging.path, path)) return false;
  if (pathsAreEqual(dragging.path, path)) return false;
  if (pathsAreEqual(parentHoverPath, parentItemPath) && hoverIndex - 1 === itemIndex) return false;
  if (
    independentCombinators &&
    pathsAreEqual(parentHoverPath, parentItemPath) &&
    hoverIndex === itemIndex - 1
  )
    return false;
  return true;
}

export function useNativeInlineCombinatorDnD(
  options: UseNativeInlineCombinatorDnDOptions
): UseNativeInlineCombinatorDnDReturn {
  const path = computed(() => toValue(options.path));
  const rules = computed(() => toValue(options.rules));
  const hoveringItem = computed(
    () => (rules.value[(path.value.at(-1) ?? 0) - 1] as RuleType | RuleGroupTypeAny) ?? null
  );

  const draggedItemRef = inject(DND_DRAGGED_ITEM_KEY);
  const lastDropResultRef = inject(DND_LAST_DROP_RESULT_KEY);
  const configRef = inject(DND_CONFIG_KEY);
  const contextRef = inject(QUERY_BUILDER_CONTEXT_KEY);
  if (!draggedItemRef || !lastDropResultRef || !configRef || !contextRef) {
    return {
      dropRef: ref(null),
      isOver: ref(false),
      dropNotAllowed: ref(false),
      dropEffect: ref('move'),
      groupItems: ref(false),
      onDragover: () => {},
      onDrop: () => {},
      onDragleave: () => {},
    };
  }

  const dropRef = ref<HTMLElement | null>(null);
  const isOverLocal = ref(false);
  const isOver = computed(() => isOverLocal.value && !!draggedItemRef?.value);
  const dropNotAllowed = ref(false);

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
      type: 'inlineCombinator',
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

    const allowed = canDropInlineCombinator(
      dragged,
      path.value,
      hoveringItem.value,
      schema.qbId,
      !!schema.independentCombinators,
      config.groupModeModifierKey,
      config.canDrop
    );
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
    const allowed = canDropInlineCombinator(
      draggedItemRef?.value ?? null,
      path.value,
      hoveringItem.value,
      (contextRef?.value?.schema as Ref<Schema> | undefined)?.value?.qbId ?? '',
      !!((contextRef?.value?.schema as Ref<Schema> | undefined)?.value?.independentCombinators),
      configRef?.value?.groupModeModifierKey ?? 'ctrl',
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

  return {
    dropRef,
    isOver,
    dropNotAllowed,
    dropEffect,
    groupItems,
    onDragover,
    onDrop,
    onDragleave,
  };
}
