import type { Path } from '@react-querybuilder/core';
import { useDroppable, useDnDStore } from '@vue-dnd-kit/core';
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

export interface UseInlineCombinatorDnDProps {
  path: Path;
  insertIndex: number;
  schema: SchemaProp;
  disabled?: boolean;
  canDrop?: (params: { dragging: { path: Path; qbId: string }; hovering: { path: Path; qbId: string } }) => boolean;
}

export interface UseInlineCombinatorDnDResult {
  dropRef: Ref<HTMLElement | null>;
  isOver: Ref<boolean>;
  dropNotAllowed: Ref<boolean>;
  dropEffect: Ref<'move' | 'copy'>;
}

const DND_GROUPS = ['rule', 'ruleGroup'];

/**
 * 使用 @vue-dnd-kit/core 实现拖拽到 InlineCombinator（规则之间）。与 plan 5.1 对齐。
 */
export function useInlineCombinatorDnD(props: UseInlineCombinatorDnDProps): UseInlineCombinatorDnDResult {
  const schemaRef = computed(() => getSchemaValue(props.schema));
  const schema = schemaRef.value;
  const qbId = schema.qbId;
  const store = useDnDStore();
  const toPath: Path = [...props.path, props.insertIndex];

  const droppable = useDroppable({
    groups: DND_GROUPS,
    disabled: props.disabled,
    data: { path: props.path, insertIndex: props.insertIndex, qbId },
    events: {
      onDrop(_store: unknown, payload: unknown) {
        const items = (payload as { items?: Array<{ data?: DragData | null }> })?.items ?? [];
        const dragged = items[0];
        const data = dragged?.data ?? null;
        if (!data) return;
        if (data.qbId !== qbId) return;
        const fromPath = data.path;
        if (pathsEqual(fromPath, toPath)) return;
        const fromIndex = fromPath[fromPath.length - 1];
        const fromParent = fromPath.slice(0, -1);
        if (fromParent.length === props.path.length && fromParent.every((p: number, i: number) => p === props.path[i]) && fromIndex === props.insertIndex) return;
        if (isDescendantOf(fromPath, props.path)) return;
        if (props.canDrop && !props.canDrop({ dragging: { path: data.path, qbId: data.qbId }, hovering: { path: props.path, qbId } })) return;
        schemaRef.value.actions.moveRule(data.path, toPath, !!unref(store.keyboard.alt), undefined);
      },
    },
  });

  const dropNotAllowed = computed(() => !droppable.isAllowed.value);
  const dropEffect = computed(() => (unref(store.keyboard.alt) ? 'copy' : 'move'));

  return {
    dropRef: droppable.elementRef as Ref<HTMLElement | null>,
    isOver: droppable.isOvered,
    dropNotAllowed,
    dropEffect,
  };
}
