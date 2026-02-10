import type { Path, RuleType } from '@react-querybuilder/core';
import { useDraggable, useDroppable, useDnDStore } from '@vue-dnd-kit/core';
import { computed, type Ref, unref } from 'vue';
import type { QueryBuilderContextValue } from '../types';
import type { DragData } from './useRuleGroupDnD';

type SchemaProp = QueryBuilderContextValue | Ref<QueryBuilderContextValue> | { value: QueryBuilderContextValue };

function getSchemaValue(s: SchemaProp): QueryBuilderContextValue {
  if (s && typeof s === 'object' && 'value' in s) return (s as { value: QueryBuilderContextValue }).value;
  return unref(s as unknown as Ref<QueryBuilderContextValue>);
}

function isDescendantOf(path: Path, ancestor: Path): boolean {
  if (ancestor.length >= path.length) return false;
  return ancestor.every((p: number, i: number) => path[i] === p);
}

function pathsEqual(a: Path, b: Path): boolean {
  return a.length === b.length && a.every((v: number, i: number) => v === b[i]);
}

export interface UseRuleDnDProps {
  path: Path;
  rule: RuleType;
  schema: SchemaProp;
  disabled?: boolean | Ref<boolean>;
  canDrop?: (params: { dragging: { path: Path; qbId: string }; hovering: RuleType & { path: Path; qbId: string } }) => boolean;
  copyModeModifierKey?: 'alt' | 'ctrl' | 'meta';
  groupModeModifierKey?: 'ctrl' | 'meta';
  hideDefaultDragPreview?: boolean;
}

export interface UseRuleDnDResult {
  dragRef: Ref<HTMLElement | null>;
  dropRef: Ref<HTMLElement | null>;
  isDragging: Ref<boolean>;
  isOver: Ref<boolean>;
  dropNotAllowed: Ref<boolean>;
  dropEffect: Ref<'move' | 'copy'>;
  groupItems: Ref<boolean>;
  handleDragStart: (event: PointerEvent | KeyboardEvent) => void;
}

const DND_GROUPS = ['rule', 'ruleGroup'];

/**
 * 使用 @vue-dnd-kit/core 实现 Rule 拖拽。与 plan 5.1 对齐。
 */
export function useRuleDnD(props: UseRuleDnDProps): UseRuleDnDResult {
  const schemaRef = computed(() => getSchemaValue(props.schema));
  const schema = schemaRef.value;
  const qbId = schema.qbId;
  const copyKey = props.copyModeModifierKey ?? 'alt';
  const groupKey = props.groupModeModifierKey ?? 'meta';
  const store = useDnDStore();
  const toPath = props.path;

  const draggable = useDraggable({
    id: `qb-${qbId}-rule-${props.path.join('-')}`,
    groups: DND_GROUPS,
    disabled: unref(props.disabled),
    data: {
      path: props.path,
      qbId,
      type: 'rule' as const,
    },
    events: {},
  });

  const droppable = useDroppable({
    groups: DND_GROUPS,
    disabled: unref(props.disabled),
    data: { path: props.path, qbId },
    events: {
      onDrop(_store: unknown, payload: unknown) {
        const items = (payload as { items?: Array<{ data?: DragData | null }> })?.items ?? [];
        const dragged = items[0];
        const data = dragged?.data ?? null;
        if (!data) return;
        if (data.qbId !== qbId) return;
        if (pathsEqual(data.path, props.path) || isDescendantOf(props.path, data.path)) return;
        if (props.canDrop && !props.canDrop({ dragging: { path: data.path, qbId: data.qbId }, hovering: { ...props.rule, path: props.path, qbId } })) return;
        const copy = copyKey === 'alt' ? store.keyboard.alt : copyKey === 'ctrl' ? store.keyboard.ctrl : store.keyboard.meta;
        schemaRef.value.actions.moveRule(data.path, toPath, !!unref(copy), undefined);
      },
    },
  });

  const dropNotAllowed = computed(() => !droppable.isAllowed.value);
  const dropEffect = computed(() => (copyKey === 'alt' ? (unref(store.keyboard.alt) ? 'copy' : 'move') : copyKey === 'ctrl' ? (unref(store.keyboard.ctrl) ? 'copy' : 'move') : unref(store.keyboard.meta) ? 'copy' : 'move'));
  const groupItems = computed(() => (groupKey === 'ctrl' ? unref(store.keyboard.ctrl) : unref(store.keyboard.meta)) ?? false);

  return {
    dragRef: draggable.elementRef as Ref<HTMLElement | null>,
    dropRef: droppable.elementRef as Ref<HTMLElement | null>,
    isDragging: draggable.isDragging,
    isOver: droppable.isOvered,
    dropNotAllowed,
    dropEffect,
    groupItems,
    handleDragStart: draggable.handleDragStart,
  };
}
