import type {
  Classnames,
  FullField,
  QueryBuilderFlags,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import {
  defaultControlClassnames,
  defaultTranslations,
  mergeAnyTranslation,
  mergeClassnames,
  preferFlagProps,
  preferProp,
} from '@react-querybuilder/core';
import type { Component, Ref } from 'vue';
import { computed, inject } from 'vue';
import { QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { defaultControlElements } from '../defaults';
import type {
  ControlElementsProp,
  Controls,
  DragHandleProps,
  QueryBuilderContextProps,
  Translations,
  TranslationsFull,
  ValueEditorProps,
} from '../types';

export type UseMergedContextParams<
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
> = QueryBuilderContextProps<F, O> & {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
  /**
   * When true, props and context are merged with defaults to ensure all properties
   * are defined. Action elements and value selectors are merged with their respective
   * bulk override components. Only needs to be true when run from `QueryBuilder`.
   */
  finalize?: Finalize;
};

export interface UseMergedContext<
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
>
  extends QueryBuilderContextProps<F, O>, QueryBuilderFlags {
  enableDragAndDrop: Finalize extends true ? boolean : boolean | undefined;
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
  controlElements: Finalize extends true ? Controls<F, O> : Partial<Controls<F, O>>;
  controlClassnames: Classnames;
  translations: Finalize extends true ? TranslationsFull : Partial<Translations>;
}

const nullComp = () => null;
const emptyObject = {} as const;

/**
 * Merges inherited context values with props, giving precedence to props.
 *
 * @group Composables
 */
export const useMergedContext = <
  F extends FullField = FullField,
  O extends string = string,
  Finalize extends boolean | undefined = undefined,
>({
  finalize,
  ...props
}: UseMergedContextParams<F, O, Finalize>): UseMergedContext<F, O, Finalize> => {
  // Get context from inject (equivalent to useContext in React)
  const contextRef = inject<Ref<QueryBuilderContextProps<F, O>> | undefined>(
    QUERY_BUILDER_CONTEXT_KEY,
    undefined
  );
  const rqbContext: QueryBuilderContextProps<F, O> = contextRef?.value ?? ({} as QueryBuilderContextProps<F, O>);

  const queryBuilderFlags = computed(() => preferFlagProps(props, rqbContext, finalize)).value;

  // Drag-and-drop should be disabled if context sets it to false because
  // QueryBuilderDnD might not have loaded @vue-dnd-kit/core yet. Therefore we prefer
  // the prop here only if context is true or undefined.
  const enableDragAndDrop = finalize
    ? rqbContext.enableDragAndDrop !== false &&
      preferProp(false, props.enableDragAndDrop, rqbContext.enableDragAndDrop)
    : (props.enableDragAndDrop ?? (rqbContext.enableDragAndDrop as boolean));

  const cc = computed(() =>
    mergeClassnames(
      finalize ? Object.assign({}, defaultControlClassnames) : emptyObject,
      rqbContext.controlClassnames,
      props.controlClassnames
    )
  ).value;

  const controlClassnames = computed(() => ({
    actionElement: cc.actionElement,
    addGroup: cc.addGroup,
    addRule: cc.addRule,
    body: cc.body,
    cloneGroup: cc.cloneGroup,
    cloneRule: cc.cloneRule,
    combinators: cc.combinators,
    dragHandle: cc.dragHandle,
    fields: cc.fields,
    header: cc.header,
    lockGroup: cc.lockGroup,
    lockRule: cc.lockRule,
    muteGroup: cc.muteGroup,
    muteRule: cc.muteRule,
    muted: cc.muted,
    notToggle: cc.notToggle,
    operators: cc.operators,
    queryBuilder: cc.queryBuilder,
    removeGroup: cc.removeGroup,
    removeRule: cc.removeRule,
    rule: cc.rule,
    ruleGroup: cc.ruleGroup,
    shiftActions: cc.shiftActions,
    value: cc.value,
    valueSelector: cc.valueSelector,
    valueSource: cc.valueSource,
    betweenRules: cc.betweenRules,
    valid: cc.valid,
    invalid: cc.invalid,
    dndDragging: cc.dndDragging,
    dndOver: cc.dndOver,
    dndCopy: cc.dndCopy,
    dndGroup: cc.dndGroup,
    dndDropNotAllowed: cc.dndDropNotAllowed,
    disabled: cc.disabled,
    valueListItem: cc.valueListItem,
    matchMode: cc.matchMode,
    matchThreshold: cc.matchThreshold,
    branches: cc.branches,
    hasSubQuery: cc.hasSubQuery,
    loading: cc.loading,
  })).value;

  const contextCE: ControlElementsProp<F, O> = rqbContext.controlElements ?? emptyObject;
  const propsCE: ControlElementsProp<F, O> = props.controlElements ?? emptyObject;
  
  // Note: defaultControlElements will be available in Phase 7
  // For now, we'll handle the merge without defaults
  const mergeControlElement = (
    name: keyof Controls<F, O>,
    // oxlint-disable-next-line typescript/no-explicit-any
    propComp: Component<any> | null | undefined,
    // oxlint-disable-next-line typescript/no-explicit-any
    contextComp: Component<any> | null | undefined,
    // oxlint-disable-next-line typescript/no-explicit-any
    defaultComp?: Component<any>
  ) => {
    const nc = nullComp;
    const propBulkOverride =
      (name.endsWith('Action') && propsCE.actionElement ? propsCE.actionElement : undefined) ??
      (name.endsWith('Selector') && propsCE.valueSelector ? propsCE.valueSelector : undefined);
    const contextBulkOverride =
      (name.endsWith('Action') && contextCE.actionElement
        ? contextCE.actionElement
        : undefined) ??
      (name.endsWith('Selector') && contextCE.valueSelector
        ? contextCE.valueSelector
        : undefined);
    const comp =
      propComp === null
        ? nc
        : (propComp ??
          (finalize ? propBulkOverride : undefined) ??
          (contextComp === null
            ? nc
            : (contextComp ?? (finalize ? contextBulkOverride : undefined))));
    return comp
      ? { [name]: comp }
      : finalize && defaultComp
        ? { [name]: defaultComp }
        : emptyObject;
  };

  // We'll need to import defaultControlElements here
  // For now, creating a placeholder that will be properly typed later
  const controlElements = computed(() => {
    // This will be properly implemented once we have defaults.ts
    // For now, return a basic structure
    return Object.assign(
      {},
      mergeControlElement('addGroupAction', propsCE.addGroupAction, contextCE.addGroupAction, defaultControlElements.addGroupAction),
      mergeControlElement('addRuleAction', propsCE.addRuleAction, contextCE.addRuleAction, defaultControlElements.addRuleAction),
      mergeControlElement(
        'cloneGroupAction',
        propsCE.cloneGroupAction,
        contextCE.cloneGroupAction,
        defaultControlElements.cloneGroupAction
      ),
      mergeControlElement('cloneRuleAction', propsCE.cloneRuleAction, contextCE.cloneRuleAction, defaultControlElements.cloneRuleAction),
      mergeControlElement(
        'combinatorSelector',
        propsCE.combinatorSelector,
        contextCE.combinatorSelector,
        defaultControlElements.combinatorSelector
      ),
      mergeControlElement('dragHandle', propsCE.dragHandle, contextCE.dragHandle, defaultControlElements.dragHandle),
      mergeControlElement('fieldSelector', propsCE.fieldSelector, contextCE.fieldSelector, defaultControlElements.fieldSelector),
      mergeControlElement(
        'inlineCombinator',
        propsCE.inlineCombinator,
        contextCE.inlineCombinator,
        defaultControlElements.inlineCombinator
      ),
      mergeControlElement('lockGroupAction', propsCE.lockGroupAction, contextCE.lockGroupAction, defaultControlElements.lockGroupAction),
      mergeControlElement('lockRuleAction', propsCE.lockRuleAction, contextCE.lockRuleAction, defaultControlElements.lockRuleAction),
      mergeControlElement('muteGroupAction', propsCE.muteGroupAction, contextCE.muteGroupAction, defaultControlElements.muteGroupAction),
      mergeControlElement('muteRuleAction', propsCE.muteRuleAction, contextCE.muteRuleAction, defaultControlElements.muteRuleAction),
      mergeControlElement('notToggle', propsCE.notToggle, contextCE.notToggle, defaultControlElements.notToggle),
      mergeControlElement(
        'operatorSelector',
        propsCE.operatorSelector,
        contextCE.operatorSelector,
        defaultControlElements.operatorSelector
      ),
      mergeControlElement(
        'removeGroupAction',
        propsCE.removeGroupAction,
        contextCE.removeGroupAction,
        defaultControlElements.removeGroupAction
      ),
      mergeControlElement(
        'removeRuleAction',
        propsCE.removeRuleAction,
        contextCE.removeRuleAction,
        defaultControlElements.removeRuleAction
      ),
      mergeControlElement('shiftActions', propsCE.shiftActions, contextCE.shiftActions, defaultControlElements.shiftActions),
      {
        valueEditor:
          propsCE.valueEditor === null
            ? nullComp
            : (propsCE.valueEditor ??
              (contextCE.valueEditor === null ? nullComp : contextCE.valueEditor) ??
              defaultControlElements.valueEditor),
      },
      mergeControlElement(
        'valueSourceSelector',
        propsCE.valueSourceSelector,
        contextCE.valueSourceSelector,
        defaultControlElements.valueSourceSelector
      ),
      mergeControlElement('matchModeEditor', propsCE.matchModeEditor, contextCE.matchModeEditor, defaultControlElements.matchModeEditor),
      mergeControlElement('rule', propsCE.rule, contextCE.rule, defaultControlElements.rule),
      mergeControlElement('ruleGroup', propsCE.ruleGroup, contextCE.ruleGroup, defaultControlElements.ruleGroup),
      mergeControlElement(
        'ruleGroupBodyElements',
        propsCE.ruleGroupBodyElements,
        contextCE.ruleGroupBodyElements,
        defaultControlElements.ruleGroupBodyElements
      ),
      mergeControlElement(
        'ruleGroupHeaderElements',
        propsCE.ruleGroupHeaderElements,
        contextCE.ruleGroupHeaderElements,
        defaultControlElements.ruleGroupHeaderElements
      ),
      {
        actionElement:
          propsCE.actionElement ??
          contextCE.actionElement ??
          defaultControlElements.actionElement,
      },
      {
        valueSelector:
          propsCE.valueSelector ??
          contextCE.valueSelector ??
          defaultControlElements.valueSelector,
      }
    ) as Finalize extends true ? ControlElementsProp<F, O> : Partial<ControlElementsProp<F, O>>;
  }).value as Finalize extends true ? Controls<F, O> : Partial<Controls<F, O>>;

  const propsT: Partial<Translations> = props.translations ?? emptyObject;
  const contextT: Partial<Translations> = rqbContext.translations ?? emptyObject;
  const translations = computed(() =>
    Object.assign(
      {},
      mergeAnyTranslation(
        'addGroup',
        {
          label: [propsT.addGroup?.label, contextT.addGroup?.label],
          title: [propsT.addGroup?.title, contextT.addGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'addRule',
        {
          label: [propsT.addRule?.label, contextT.addRule?.label],
          title: [propsT.addRule?.title, contextT.addRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'cloneRule',
        {
          label: [propsT.cloneRule?.label, contextT.cloneRule?.label],
          title: [propsT.cloneRule?.title, contextT.cloneRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'cloneRuleGroup',
        {
          label: [propsT.cloneRuleGroup?.label, contextT.cloneRuleGroup?.label],
          title: [propsT.cloneRuleGroup?.title, contextT.cloneRuleGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'combinators',
        { title: [propsT.combinators?.title, contextT.combinators?.title] },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'dragHandle',
        {
          label: [propsT.dragHandle?.label, contextT.dragHandle?.label],
          title: [propsT.dragHandle?.title, contextT.dragHandle?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'fields',
        {
          placeholderGroupLabel: [
            propsT.fields?.placeholderGroupLabel,
            contextT.fields?.placeholderGroupLabel,
          ],
          placeholderLabel: [propsT.fields?.placeholderLabel, contextT.fields?.placeholderLabel],
          placeholderName: [propsT.fields?.placeholderName, contextT.fields?.placeholderName],
          title: [propsT.fields?.title, contextT.fields?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'lockGroup',
        {
          label: [propsT.lockGroup?.label, contextT.lockGroup?.label],
          title: [propsT.lockGroup?.title, contextT.lockGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'lockGroupDisabled',
        {
          label: [propsT.lockGroupDisabled?.label, contextT.lockGroupDisabled?.label],
          title: [propsT.lockGroupDisabled?.title, contextT.lockGroupDisabled?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'lockRule',
        {
          label: [propsT.lockRule?.label, contextT.lockRule?.label],
          title: [propsT.lockRule?.title, contextT.lockRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'lockRuleDisabled',
        {
          label: [propsT.lockRuleDisabled?.label, contextT.lockRuleDisabled?.label],
          title: [propsT.lockRuleDisabled?.title, contextT.lockRuleDisabled?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'muteGroup',
        {
          label: [propsT.muteGroup?.label, contextT.muteGroup?.label],
          title: [propsT.muteGroup?.title, contextT.muteGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'unmuteGroup',
        {
          label: [propsT.unmuteGroup?.label, contextT.unmuteGroup?.label],
          title: [propsT.unmuteGroup?.title, contextT.unmuteGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'muteRule',
        {
          label: [propsT.muteRule?.label, contextT.muteRule?.label],
          title: [propsT.muteRule?.title, contextT.muteRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'unmuteRule',
        {
          label: [propsT.unmuteRule?.label, contextT.unmuteRule?.label],
          title: [propsT.unmuteRule?.title, contextT.unmuteRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'notToggle',
        {
          label: [propsT.notToggle?.label, contextT.notToggle?.label],
          title: [propsT.notToggle?.title, contextT.notToggle?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'operators',
        {
          placeholderGroupLabel: [
            propsT.operators?.placeholderGroupLabel,
            contextT.operators?.placeholderGroupLabel,
          ],
          placeholderLabel: [
            propsT.operators?.placeholderLabel,
            contextT.operators?.placeholderLabel,
          ],
          placeholderName: [
            propsT.operators?.placeholderName,
            contextT.operators?.placeholderName,
          ],
          title: [propsT.operators?.title, contextT.operators?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'values',
        {
          placeholderGroupLabel: [
            propsT.values?.placeholderGroupLabel,
            contextT.values?.placeholderGroupLabel,
          ],
          placeholderLabel: [propsT.values?.placeholderLabel, contextT.values?.placeholderLabel],
          placeholderName: [propsT.values?.placeholderName, contextT.values?.placeholderName],
          title: [propsT.values?.title, contextT.values?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'removeGroup',
        {
          label: [propsT.removeGroup?.label, contextT.removeGroup?.label],
          title: [propsT.removeGroup?.title, contextT.removeGroup?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'removeRule',
        {
          label: [propsT.removeRule?.label, contextT.removeRule?.label],
          title: [propsT.removeRule?.title, contextT.removeRule?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'shiftActionDown',
        {
          label: [propsT.shiftActionDown?.label, contextT.shiftActionDown?.label],
          title: [propsT.shiftActionDown?.title, contextT.shiftActionDown?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'shiftActionUp',
        {
          label: [propsT.shiftActionUp?.label, contextT.shiftActionUp?.label],
          title: [propsT.shiftActionUp?.title, contextT.shiftActionUp?.title],
        },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'matchMode',
        { title: [propsT.matchMode?.title, contextT.matchMode?.title] },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'matchThreshold',
        { title: [propsT.matchThreshold?.title, contextT.matchThreshold?.title] },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'value',
        { title: [propsT.value?.title, contextT.value?.title] },
        finalize ? defaultTranslations : undefined
      ),
      mergeAnyTranslation(
        'valueSourceSelector',
        { title: [propsT.valueSourceSelector?.title, contextT.valueSourceSelector?.title] },
        finalize ? defaultTranslations : undefined
      )
    )
  ).value as Finalize extends true ? TranslationsFull : Partial<Translations>;

  return {
    ...queryBuilderFlags,
    controlClassnames,
    controlElements,
    enableDragAndDrop,
    translations,
    initialQuery: props.initialQuery,
    qbId: props.qbId,
  };
};
