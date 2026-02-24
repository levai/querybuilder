/**
 * Applies a drop result to the query: move/group within same builder or insert into another.
 * Ported from @react-querybuilder/dnd useDragCommon end logic.
 */
import type { DraggedItem, DropResult, Path, QueryActions } from '@react-querybuilder/core';
import { add, getParentPath, group, insert } from '@react-querybuilder/core';

export function applyDrop(
  item: DraggedItem,
  dropResult: DropResult,
  actions: Pick<QueryActions, 'moveRule' | 'groupRule' | 'onRuleRemove'>
): void {
  const dropEffect = dropResult.dropEffect ?? 'move';
  const groupItems = dropResult.groupItems ?? false;

  const parentHoverPath = getParentPath(dropResult.path);
  const hoverIndex = dropResult.path.at(-1)!;
  const destinationPath: Path = groupItems
    ? dropResult.path
    : dropResult.type === 'ruleGroup'
      ? [...dropResult.path, 0]
      : dropResult.type === 'inlineCombinator'
        ? [...parentHoverPath, hoverIndex]
        : [...parentHoverPath, hoverIndex + 1];

  if (item.qbId === dropResult.qbId) {
    if (groupItems) {
      actions.groupRule(item.path, destinationPath, dropEffect === 'copy');
    } else {
      actions.moveRule(item.path, destinationPath, dropEffect === 'copy');
    }
    return;
  }

  const otherBuilderQuery = dropResult.getQuery();
  if (!otherBuilderQuery) return;

  if (groupItems) {
    dropResult.dispatchQuery(
      group(add(otherBuilderQuery, item, []), [otherBuilderQuery.rules.length], destinationPath, {
        clone: false,
      })
    );
  } else {
    dropResult.dispatchQuery(insert(otherBuilderQuery, item, destinationPath));
  }
  if (dropEffect !== 'copy') {
    actions.onRuleRemove(item.path);
  }
}
