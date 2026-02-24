/**
 * Vue 3 QueryBuilder context — provide/inject keys for single source (queryRef + path).
 * @see REFACTOR-VUE3.md
 */
import type { InjectionKey, Ref } from 'vue';
import type { DraggedItem, DropResult, RuleGroupTypeAny } from '@react-querybuilder/core';
import type { QueryActions, Schema, TranslationsFull } from '../types';

/** 根 query 的 ref，子组件通过 findPath(queryRef.value, path) 取当前节点 */
export const QUERY_REF_KEY = Symbol(
  'vue-querybuilder-query-ref'
) as InjectionKey<Ref<RuleGroupTypeAny | null>>;

/** 更新 query 的唯一入口：(newQuery) => void */
export const DISPATCH_KEY = Symbol(
  'vue-querybuilder-dispatch'
) as InjectionKey<(query: RuleGroupTypeAny) => void>;

/** Schema、translations、actions 等只读上下文 */
export interface QueryBuilderContextType {
  schema: Ref<Schema | undefined>;
  translations?: Ref<TranslationsFull | undefined>;
  actions?: Ref<QueryActions | undefined>;
  queryRef?: Ref<RuleGroupTypeAny | null>;
  dispatch?: (query: RuleGroupTypeAny) => void;
}

export const QUERY_BUILDER_CONTEXT_KEY = Symbol(
  'vue-querybuilder-context'
) as InjectionKey<Ref<QueryBuilderContextType>>;

/** Native DnD: 当前正在拖拽的项，dragstart 设置、dragend 清除 */
export const DND_DRAGGED_ITEM_KEY = Symbol(
  'vue-querybuilder-dnd-dragged-item'
) as InjectionKey<Ref<DraggedItem | null>>;

/** Native DnD: 最近一次有效 drop 结果，drop 时设置、dragend 消费后清除 */
export const DND_LAST_DROP_RESULT_KEY = Symbol(
  'vue-querybuilder-dnd-last-drop-result'
) as InjectionKey<Ref<DropResult | null>>;

/** Native DnD 配置（canDrop、修饰键等） */
export interface DndConfig {
  canDrop?: (params: { dragging: DraggedItem; hovering: DraggedItem; groupItems?: boolean }) => boolean;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
  hideDefaultDragPreview?: boolean;
}

export const DND_CONFIG_KEY = Symbol(
  'vue-querybuilder-dnd-config'
) as InjectionKey<Ref<DndConfig>>;
