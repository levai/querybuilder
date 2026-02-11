import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionMap,
  GetOptionIdentifierType,
  GetRuleTypeFromGroupWithFieldAndOperator,
  MatchModeOptions,
  Path,
  QueryActions,
  QueryValidator,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  UpdateableProperties,
  ValidationMap,
  ValueSourceFullOptions,
} from '@react-querybuilder/core';
import {
  add,
  clsx,
  findPath,
  generateAccessibleDescription,
  getPathOfID,
  group,
  isRuleGroup,
  isRuleGroupTypeIC,
  LogType,
  move,
  pathIsDisabled,
  prepareRuleGroup,
  remove,
  standardClassnames,
  update,
} from '@react-querybuilder/core';
import { computed, ref, toRef, toRefs, watch, type ComputedRef } from 'vue';
import { useControlledOrUncontrolled } from './useControlledOrUncontrolled';
import { useDeprecatedProps } from './useDeprecatedProps';
import { getQueryById, getQueriesStore, setQueryById } from '../state/queryStore';
import type { QueryBuilderProps, RuleGroupProps, Schema, TranslationsFull } from '../types';
import type { UseQueryBuilderSetup } from './useQueryBuilderSetup';

const defaultValidationResult: ReturnType<QueryValidator> = {};
const defaultValidationMap: ValidationMap = {};
const defaultDisabledPaths: Path[] = [];
const icCombinatorPropObject = {} as const;
const defaultGetValueEditorSeparator = () => null;
const defaultGetRuleOrGroupClassname = () => '';
const defaultOnAddMoveRemove = () => true;
// istanbul ignore next
const defaultOnLog = (...params: unknown[]) => {
  console.log(...params);
};

export type UseQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> = Pick<UseQueryBuilderSetup<RG, F, O, C>, 'rqbContext'> & {
  actions: QueryActions;
  rootGroup: RuleGroupTypeAny<GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>>;
  rootGroupDisabled: boolean;
  queryDisabled: boolean;
  schema: ComputedRef<Schema<F, GetOptionIdentifierType<O>>>;
  translations: TranslationsFull;
  wrapperClassName: string;
  dndEnabledAttr: string;
  inlineCombinatorsAttr: string;
  combinatorPropObject: Pick<RuleGroupProps, 'combinator'>;
};

/**
 * For given {@link QueryBuilderProps} and setup values from {@link useQueryBuilderSetup},
 * prepares and returns all values required to render a query builder.
 *
 * @group Composables
 */
export function useQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: QueryBuilderProps<RG, F, O, C>,
  setup: UseQueryBuilderSetup<RG, F, O, C>
): UseQueryBuilderSchema<RG, F, O, C> {
  type R = GetRuleTypeFromGroupWithFieldAndOperator<RG, F, O>;

  // Extract onUpdateModelValue separately since TypeScript may not recognize it in destructuring
  // Check if it exists in props using 'in' operator
  const onUpdateModelValue = ('onUpdateModelValue' in props && typeof (props as any).onUpdateModelValue === 'function')
    ? (props as any).onUpdateModelValue as ((query: RG) => void)
    : undefined;
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[useQueryBuilderSchema] onUpdateModelValue extracted:', {
      hasProp: 'onUpdateModelValue' in props,
      isFunction: typeof onUpdateModelValue === 'function',
      propsKeys: Object.keys(props).slice(0, 10), // First 10 keys for debugging
    });
  }

  // 在 Vue 3 中，从 props 解构会丢失响应式
  // 对于需要响应式的值，使用 toRef 或直接在 computed 中访问 props
  const {
    modelValue: queryProp,
    defaultQuery: defaultQueryProp,
    getValueEditorSeparator = defaultGetValueEditorSeparator,
    getRuleClassname = defaultGetRuleOrGroupClassname,
    getRuleGroupClassname = defaultGetRuleOrGroupClassname,
    onAddRule = defaultOnAddMoveRemove,
    onAddGroup = defaultOnAddMoveRemove,
    onMoveRule = defaultOnAddMoveRemove,
    onMoveGroup = defaultOnAddMoveRemove,
    onGroupRule = defaultOnAddMoveRemove,
    onGroupGroup = defaultOnAddMoveRemove,
    onRemove = defaultOnAddMoveRemove,
    parseNumbers = false,
    disabled = false,
    validator,
    onLog = defaultOnLog,
    idGenerator,
    accessibleDescriptionGenerator = generateAccessibleDescription,
  } = props;

  // 在 Vue 3 中，直接从 props 解构会丢失响应式
  // 对于需要响应式的选项，使用 computed 直接访问 props，这样既能保持响应式又能处理默认值

  const {
    qbId,
    rqbContext: incomingRqbContext,
    fields,
    fieldMap,
    combinators,
    getOperatorsMain,
    getMatchModesMain,
    getRuleDefaultOperator,
    getSubQueryBuilderPropsMain,
    getValueEditorTypeMain,
    getValueSourcesMain,
    getValuesMain,
    getRuleDefaultValue,
    getInputTypeMain,
    createRule,
    createRuleGroup,
  } = setup;

  const {
    controlClassnames,
    controlElements: controls,
    debugMode,
    enableDragAndDrop,
    enableMountQueryChange,
    translations,
  } = incomingRqbContext;

  // #region Type coercions - 使用 computed 直接访问 props 确保响应式
  // 直接访问 props 属性，Vue 会自动追踪响应式
  const showCombinatorsBetweenRules = computed(() => {
    const value = !!(props.showCombinatorsBetweenRules ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showCombinatorsBetweenRules computed:', value, 'from props:', props.showCombinatorsBetweenRules);
    }
    return value;
  });
  const showNotToggle = computed(() => {
    const value = !!(props.showNotToggle ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showNotToggle computed:', value, 'from props:', props.showNotToggle);
    }
    return value;
  });
  const showShiftActions = computed(() => {
    const value = !!(props.showShiftActions ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showShiftActions computed:', value, 'from props:', props.showShiftActions);
    }
    return value;
  });
  const showCloneButtons = computed(() => {
    const value = !!(props.showCloneButtons ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showCloneButtons computed:', value, 'from props:', props.showCloneButtons);
    }
    return value;
  });
  const showLockButtons = computed(() => {
    const value = !!(props.showLockButtons ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showLockButtons computed:', value, 'from props:', props.showLockButtons);
    }
    return value;
  });
  const showMuteButtons = computed(() => {
    const value = !!(props.showMuteButtons ?? false);
    if (import.meta.env.DEV) {
      console.log('[useQueryBuilderSchema] showMuteButtons computed:', value, 'from props:', props.showMuteButtons);
    }
    return value;
  });
  const resetOnFieldChange = computed(() => !!(props.resetOnFieldChange ?? true));
  const resetOnOperatorChange = computed(() => !!(props.resetOnOperatorChange ?? false));
  const autoSelectField = computed(() => !!(props.autoSelectField ?? true));
  const autoSelectOperator = computed(() => !!(props.autoSelectOperator ?? true));
  const autoSelectValue = computed(() => !!(props.autoSelectValue ?? true));
  const addRuleToNewGroups = computed(() => !!(props.addRuleToNewGroups ?? false));
  const listsAsArrays = computed(() => !!(props.listsAsArrays ?? false));
  const suppressStandardClassnames = computed(() => !!(props.suppressStandardClassnames ?? false));
  const maxLevels = computed(() => ((props.maxLevels ?? 0) > 0 ? Number(props.maxLevels) : Infinity));
  // #endregion

  const log = (...params: unknown[]) => {
    if (debugMode) {
      onLog(...params);
    }
  };

  // #region Controlled vs uncontrolled mode
  useControlledOrUncontrolled({
    defaultQuery: defaultQueryProp,
    modelValue: queryProp,
  });

  // Access the reactive store directly in computed to ensure Vue tracks changes
  const queriesStore = getQueriesStore();
  const storeQuery = computed(() => queriesStore.value[qbId]);
  const getQuery = (): RuleGroupTypeAny => {
    const query = queriesStore.value[qbId];
    if (!query) {
      throw new Error('Query not found in store');
    }
    return query;
  };

  const fallbackQuery = computed(() => createRuleGroup()).value;

  // We assume here that if the query has an `id` property, the query has already
  // been prepared. If `candidateQuery === query`, the user is probably just
  // passing back the parameter from the `onUpdateModelValue` callback.
  // IMPORTANT: rootGroup must be computed to respond to storeQuery changes
  // Directly access queriesStore.value[qbId] in computed to ensure reactivity
  const rootGroup = computed(() => {
    const candidateQuery = queryProp ?? queriesStore.value[qbId] ?? defaultQueryProp ?? fallbackQuery;
    // Ensure candidateQuery is a valid rule group before calling prepareRuleGroup
    if (!candidateQuery || !isRuleGroup(candidateQuery)) {
      return fallbackQuery as RuleGroupTypeAny<R>;
    }
    return (candidateQuery.id ? candidateQuery : prepareRuleGroup(candidateQuery, { idGenerator })) as RuleGroupTypeAny<R>;
  });

  const initialQuery = ref(rootGroup.value);
  const rqbContext = computed(() => ({ ...incomingRqbContext, initialQuery: initialQuery.value })).value;

  // If a new `modelValue` prop is passed in that doesn't match the query in the store,
  // update the store to match the prop _without_ calling `onUpdateModelValue`.
  watch(
    () => queryProp,
    (newQueryProp) => {
      if (!!newQueryProp && !Object.is(newQueryProp, queriesStore.value[qbId])) {
        setQueryById(qbId, newQueryProp);
      }
    },
    { immediate: false }
  );

  const independentCombinators = computed(() => isRuleGroupTypeIC(rootGroup.value)).value;
  const invalidIC = !!props.independentCombinators && !independentCombinators;
  // Check if independentCombinators prop was explicitly passed
  // In Vue 3, we check if the prop exists in the props object
  const hasIndependentCombinatorsProp = 'independentCombinators' in props;
  useDeprecatedProps(
    'independentCombinators',
    invalidIC || (!invalidIC && hasIndependentCombinatorsProp),
    invalidIC ? 'invalid' : 'unnecessary'
  );

  const hasRunMountQueryChange = ref(false);
  watch(
    () => [enableMountQueryChange, rootGroup.value],
    () => {
      if (hasRunMountQueryChange.value) return;
      hasRunMountQueryChange.value = true;
      setQueryById(qbId, rootGroup.value);
      // Leave `onUpdateModelValue` undefined if `enableMountQueryChange` is disabled
      if (enableMountQueryChange && typeof onUpdateModelValue === 'function') {
        onUpdateModelValue(rootGroup.value as unknown as RG);
      }
    },
    { immediate: true }
  );

  /**
   * Updates the reactive store-based query, then calls `onUpdateModelValue` with the updated
   * query object.
   */
  const dispatchQuery = (newQuery: RuleGroupTypeAny) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[dispatchQuery] Before setQueryById:', {
        qbId,
        newQueryRules: newQuery.rules?.length,
        storeBefore: queriesStore.value[qbId]?.rules?.length,
      });
    }
    setQueryById(qbId, newQuery);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[dispatchQuery] After setQueryById:', {
        qbId,
        storeAfter: queriesStore.value[qbId]?.rules?.length,
        storeIsReactive: queriesStore.value[qbId] === newQuery,
      });
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('[dispatchQuery] Called with:', {
        hasOnUpdateModelValue: typeof onUpdateModelValue === 'function',
        newQueryRules: newQuery.rules?.length,
        qbId,
      });
    }
    if (typeof onUpdateModelValue === 'function') {
      onUpdateModelValue(newQuery as unknown as RG);
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('[dispatchQuery] onUpdateModelValue is not a function:', typeof onUpdateModelValue);
    }
  };
  // #endregion

  // #region Query update methods
  const disabledPaths = (Array.isArray(disabled) && disabled) || defaultDisabledPaths;
  const queryDisabled = disabled === true;
  const rootGroupDisabled = computed(() => rootGroup.value.disabled || disabledPaths.some(p => p.length === 0)).value;

  const onRuleAdd = (
    // oxlint-disable-next-line typescript/no-explicit-any
    rule: R,
    parentPath: Path,
    context?: any
  ) => {
    const queryLocal = getQueryById(qbId) as RG;
    // istanbul ignore if
    if (!queryLocal) return;
    if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
      log({ qbId, type: LogType.parentPathDisabled, rule, parentPath, query: queryLocal });
      return;
    }
    const nextRule = onAddRule(rule, parentPath, queryLocal, context);
    if (!nextRule) {
      log({ qbId, type: LogType.onAddRuleFalse, rule, parentPath, query: queryLocal });
      return;
    }
    const newRule = nextRule === true ? rule : nextRule;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    const newQuery = add(queryLocal, newRule, parentPath, {
      combinators,
      combinatorPreceding: newRule.combinatorPreceding ?? undefined,
      idGenerator,
    });
    log({ qbId, type: LogType.add, query: queryLocal, newQuery, newRule, parentPath });
    dispatchQuery(newQuery);
  };

  const onGroupAdd = (
    // oxlint-disable-next-line typescript/no-explicit-any
    ruleGroup: RG,
    parentPath: Path,
    context?: any
  ) => {
    if (parentPath.length >= maxLevels.value) return;
    const queryLocal = getQueryById(qbId) as RG;
    // istanbul ignore if
    if (!queryLocal) return;
    if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) {
      log({
        qbId,
        type: LogType.parentPathDisabled,
        ruleGroup,
        parentPath,
        query: queryLocal,
      });
      return;
    }
    const nextGroup = onAddGroup(ruleGroup, parentPath, queryLocal, context);
    if (!nextGroup) {
      log({ qbId, type: LogType.onAddGroupFalse, ruleGroup, parentPath, query: queryLocal });
      return;
    }
    const newGroup = nextGroup === true ? ruleGroup : nextGroup;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    const newQuery = add(queryLocal, newGroup, parentPath, {
      combinators,
      combinatorPreceding: (newGroup as RuleGroupTypeIC).combinatorPreceding ?? undefined,
      idGenerator,
    });
    log({ qbId, type: LogType.add, query: queryLocal, newQuery, newGroup, parentPath });
    dispatchQuery(newQuery);
  };

  const onPropChange = (
    // oxlint-disable-next-line typescript/no-explicit-any
    prop: UpdateableProperties,
    value: any,
    path: Path
  ) => {
    const queryLocal = getQueryById(qbId);
    // istanbul ignore if
    if (!queryLocal) return;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) {
      log({ qbId, type: LogType.pathDisabled, path, prop, value, query: queryLocal });
      return;
    }

    const newQuery = update(queryLocal, prop, value, path, {
      resetOnFieldChange: resetOnFieldChange.value,
      resetOnOperatorChange: resetOnOperatorChange.value,
      getRuleDefaultOperator: getRuleDefaultOperator as (field: string) => string,
      getValueSources: getValueSourcesMain as (
        field: string,
        operator: string
      ) => ValueSourceFullOptions,
      getRuleDefaultValue,
      getMatchModes: getMatchModesMain as (field: string) => MatchModeOptions,
    });
    log({ qbId, type: LogType.update, query: queryLocal, newQuery, prop, value, path });
    dispatchQuery(newQuery);
  };

  const onRuleOrGroupRemove = (
    // oxlint-disable-next-line typescript/no-explicit-any
    path: Path,
    context?: any
  ) => {
    const queryLocal = getQueryById(qbId) as RG;
    // istanbul ignore if
    if (!queryLocal) return;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    if (pathIsDisabled(path, queryLocal) || queryDisabled) {
      log({ qbId, type: LogType.pathDisabled, path, query: queryLocal });
      return;
    }
    const ruleOrGroup = findPath(path, queryLocal) as RG | R;
    if (ruleOrGroup) {
      if (onRemove(ruleOrGroup, path, queryLocal, context)) {
        const newQuery = remove(queryLocal, path);
        log({ qbId, type: LogType.remove, query: queryLocal, newQuery, path, ruleOrGroup });
        dispatchQuery(newQuery);
      } else {
        log({ qbId, type: LogType.onRemoveFalse, ruleOrGroup, path, query: queryLocal });
      }
    } else {
      // If findPath returns null, the path is likely stale (e.g., after previous deletions)
      // Try to find the rule/group by checking the parent and using the last valid index
      const parentPath = path.slice(0, -1);
      const parent = findPath(parentPath, queryLocal);
      const index = path.at(-1)!;
      
      if (parent && isRuleGroup(parent)) {
        // If index is out of bounds, try to remove the last item
        // This handles the case where the path is stale after previous deletions
        if (index >= parent.rules.length && parent.rules.length > 0) {
          const lastIndex = parent.rules.length - 1;
          const lastItem = parent.rules[lastIndex];
          // Only remove if it's a rule or group (not a combinator string)
          if (lastItem && typeof lastItem !== 'string') {
            const correctedPath = [...parentPath, lastIndex];
            const ruleOrGroupAtPath = findPath(correctedPath, queryLocal) as RG | R;
            if (ruleOrGroupAtPath && onRemove(ruleOrGroupAtPath, correctedPath, queryLocal, context)) {
              const newQuery = remove(queryLocal, correctedPath);
              log({ qbId, type: LogType.remove, query: queryLocal, newQuery, path: correctedPath, ruleOrGroup: ruleOrGroupAtPath, note: 'corrected stale path' });
              dispatchQuery(newQuery);
              return;
            }
          }
        } else if (index < parent.rules.length) {
          // Index is valid, try to remove (remove function handles validation)
          const newQuery = remove(queryLocal, path);
          if (newQuery !== queryLocal) {
            log({ qbId, type: LogType.remove, query: queryLocal, newQuery, path, note: 'removed despite findPath returning null' });
            dispatchQuery(newQuery);
            return;
          }
        }
      }
      
      // Debug: log when we can't remove
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[onRuleOrGroupRemove] Cannot remove - path invalid', {
          path,
          queryRules: queryLocal.rules?.length,
          parentPath: path.slice(0, -1),
          index: path.at(-1),
          rulesArray: queryLocal.rules,
        });
      }
    }
  };

  const moveRule = (
    // oxlint-disable-next-line typescript/no-explicit-any
    oldPath: Path,
    newPath: Path | 'up' | 'down',
    clone?: boolean,
    context?: any
  ) => {
    const queryLocal = getQueryById(qbId) as RG;
    // istanbul ignore if
    if (!queryLocal) return;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    if (pathIsDisabled(oldPath, queryLocal) || queryDisabled) {
      log({ qbId, type: LogType.pathDisabled, oldPath, newPath, query: queryLocal });
      return;
    }
    const nextQuery = move(queryLocal, oldPath, newPath, { clone, combinators, idGenerator });
    const ruleOrGroup = findPath(oldPath, queryLocal)!;
    const isGroup = isRuleGroup(ruleOrGroup);
    const callbackResult = (
      (isGroup ? onMoveGroup : onMoveRule) as (...args: unknown[]) => RG | boolean
    )(ruleOrGroup, oldPath, newPath, queryLocal, nextQuery, { clone, combinators }, context);
    if (!callbackResult) {
      log({
        qbId,
        type: isGroup ? LogType.onMoveGroupFalse : LogType.onMoveRuleFalse,
        ruleOrGroup,
        oldPath,
        newPath,
        clone,
        query: queryLocal,
        nextQuery,
      });
      return;
    }
    const newQuery = isRuleGroup(callbackResult) ? callbackResult : nextQuery;
    log({ qbId, type: LogType.move, query: queryLocal, newQuery, oldPath, newPath, clone });
    dispatchQuery(newQuery);
  };

  const groupRule = (
    // oxlint-disable-next-line typescript/no-explicit-any
    sourcePath: Path,
    targetPath: Path,
    clone?: boolean,
    context?: any
  ) => {
    const queryLocal = getQueryById(qbId) as RG;
    // istanbul ignore if
    if (!queryLocal) return;
    // queriesStore.value[qbId] returns plain object (not Vue proxy), so no toRaw() needed
    if (pathIsDisabled(sourcePath, queryLocal) || queryDisabled) {
      log({ qbId, type: LogType.pathDisabled, sourcePath, targetPath, query: queryLocal });
      return;
    }
    const nextQuery = group(queryLocal, sourcePath, targetPath, {
      clone,
      combinators,
      idGenerator,
    });
    const ruleOrGroup = findPath(sourcePath, queryLocal)!;
    const isGroup = isRuleGroup(ruleOrGroup);
    const callbackResult = (
      (isGroup ? onGroupGroup : onGroupRule) as (...args: unknown[]) => RG | boolean
    )(
      ruleOrGroup,
      sourcePath,
      targetPath,
      queryPlain,
      nextQuery,
      { clone, combinators },
      context
    );
    if (!callbackResult) {
      log({
        qbId,
        type: isGroup ? LogType.onGroupGroupFalse : LogType.onGroupRuleFalse,
        ruleOrGroup,
        sourcePath,
        targetPath,
        clone,
        query: queryPlain,
        nextQuery,
      });
      return;
    }
    const newQuery = isRuleGroup(callbackResult) ? callbackResult : nextQuery;
    log({
      qbId,
      type: LogType.group,
      query: queryPlain,
      newQuery,
      sourcePath,
      targetPath,
      clone,
    });
    dispatchQuery(newQuery);
  };
  // #endregion

  // #region Validation
  const { validationResult, validationMap } = computed(() => {
    const currentRootGroup = rootGroup.value;
    const validationResult =
      typeof validator === 'function' && currentRootGroup ? validator(currentRootGroup) : defaultValidationResult;
    const validationMap =
      typeof validationResult === 'boolean' ? defaultValidationMap : validationResult;
    return { validationResult, validationMap };
  }).value;
  // #endregion

  // #region Miscellaneous
  // 这些属性需要响应式，因为选项可能变化
  const dndEnabledAttr = computed(() => enableDragAndDrop ? 'enabled' : 'disabled');
  const inlineCombinatorsAttr = computed(() =>
    (independentCombinators || showCombinatorsBetweenRules.value) ? 'enabled' : 'disabled'
  );
  const combinatorPropObject: Pick<RuleGroupProps, 'combinator'> = computed(() =>
    typeof rootGroup.value.combinator === 'string'
      ? { combinator: rootGroup.value.combinator }
      : icCombinatorPropObject
  ).value;
  const wrapperClassName = computed(() =>
    clsx(
      suppressStandardClassnames.value || standardClassnames.queryBuilder,
      clsx(controlClassnames.queryBuilder),
      // custom conditional classes
      queryDisabled && controlClassnames.disabled,
      typeof validationResult === 'boolean' && validationResult && controlClassnames.valid,
      typeof validationResult === 'boolean' && !validationResult && controlClassnames.invalid,
      // standard conditional classes
      suppressStandardClassnames.value || {
        [standardClassnames.disabled]: queryDisabled,
        [standardClassnames.valid]: typeof validationResult === 'boolean' && validationResult,
        [standardClassnames.invalid]: typeof validationResult === 'boolean' && !validationResult,
      }
    )
  );
  // #endregion

  // #region Setup overrides
  /**
   * This function overrides `createRuleGroup` from `useQueryBuilderSetup`, removing the
   * requirement to pass a `boolean` parameter. If `independentCombinators` is `true`, it will
   * always create a `RuleGroupTypeIC` even if called with no parameters. (We have to override
   * it here because `independentCombinators` is not evaluated in `useQueryBuilderSetup`.)
   */
  const createRuleGroupOverride = (ic?: boolean) => createRuleGroup(ic ?? independentCombinators);
  // #endregion

  // #region Schema/actions
  // schema 保持为 computed，确保选项变化时能响应式更新
  const schema = computed(
    (): Schema<F, GetOptionIdentifierType<O>> => {
      const schemaValue = {
        addRuleToNewGroups: addRuleToNewGroups.value,
        accessibleDescriptionGenerator,
        autoSelectField: autoSelectField.value,
        autoSelectOperator: autoSelectOperator.value,
        autoSelectValue: autoSelectValue.value,
        classNames: controlClassnames,
        combinators,
        controls,
        createRule,
        createRuleGroup: createRuleGroupOverride,
        disabledPaths,
        enableDragAndDrop,
        fieldMap: fieldMap as FullOptionMap<F>,
        fields,
        dispatchQuery,
        getQuery,
        getInputType: getInputTypeMain,
        getOperators: getOperatorsMain,
        getMatchModes: getMatchModesMain,
        getRuleClassname,
        getRuleGroupClassname,
        getSubQueryBuilderProps: getSubQueryBuilderPropsMain,
        getValueEditorSeparator,
        getValueEditorType: getValueEditorTypeMain,
        getValues: getValuesMain,
        getValueSources: getValueSourcesMain,
        independentCombinators,
        listsAsArrays: listsAsArrays.value,
        maxLevels: maxLevels.value,
        parseNumbers,
        qbId,
        showCloneButtons: showCloneButtons.value,
        showCombinatorsBetweenRules: showCombinatorsBetweenRules.value,
        showLockButtons: showLockButtons.value,
        showMuteButtons: showMuteButtons.value,
        showNotToggle: showNotToggle.value,
        showShiftActions: showShiftActions.value,
        suppressStandardClassnames: suppressStandardClassnames.value,
        validationMap,
      };
      
      if (import.meta.env.DEV) {
        console.log('[useQueryBuilderSchema] schema computed:', {
          showCloneButtons: schemaValue.showCloneButtons,
          showLockButtons: schemaValue.showLockButtons,
          showMuteButtons: schemaValue.showMuteButtons,
          showNotToggle: schemaValue.showNotToggle,
          showShiftActions: schemaValue.showShiftActions,
          showCombinatorsBetweenRules: schemaValue.showCombinatorsBetweenRules,
        });
      }
      
      return schemaValue;
    }
  );

  const actions = computed(
    (): QueryActions => ({
      moveRule,
      onGroupAdd,
      onGroupRemove: onRuleOrGroupRemove,
      onPropChange,
      onRuleAdd,
      onRuleRemove: onRuleOrGroupRemove,
      groupRule,
    })
  ).value;
  // #endregion

  // Return rootGroup as a getter function to maintain reactivity
  // The component will call this getter to get the current value
  return {
    actions,
    rootGroup: rootGroup.value, // Return the value, but components should access store directly
    rootGroupDisabled,
    queryDisabled,
    rqbContext: {
      ...rqbContext,
      qbId, // Expose qbId so components can access the store directly
    },
    schema,
    translations,
    wrapperClassName: wrapperClassName.value,
    dndEnabledAttr: dndEnabledAttr.value,
    inlineCombinatorsAttr: inlineCombinatorsAttr.value,
    combinatorPropObject,
  };
}
