/**
 * Vue 3 QueryBuilder schema and state — single queryRef, no Redux.
 * Mirrors React's useQueryBuilderSchema + useQueryBuilderSetup, using ref + provide.
 */
// @ts-nocheck - complex generics with FullOperator/FullField; fix incrementally
import {
  add,
  clsx,
  findPath,
  generateID,
  getFirstOption,
  getOption,
  isRuleGroup,
  isRuleGroupType,
  isRuleGroupTypeIC,
  mergeAnyTranslations,
  pathIsDisabled,
  prepareOptionList,
  prepareRuleGroup,
  remove,
  standardClassnames,
  update,
  move,
  defaultCombinators,
  defaultOperators,
  defaultTranslations,
  filterFieldsByComparator,
  getValueSourcesUtil,
  getMatchModesUtil,
  getValidationClassNames,
  type Path,
  type RuleGroupTypeAny,
  type RuleType,
  type UpdateableProperties,
  type FullOptionList,
  type FullField,
  type FullOperator,
  type FullCombinator,
  type MatchModeOptions,
  type ValueSourceFullOptions,
} from '@react-querybuilder/core';
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, ref, toValue, watch } from 'vue';
import type { QueryBuilderProps, Schema, QueryActions, TranslationsFull, Controls, Classnames } from '../types';

const defaultDisabledPaths: Path[] = [];
const defaultValidationMap = {};

export interface UseQueryBuilderSchemaReturn<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
> {
  queryRef: Ref<RG | null>;
  dispatchQuery: (query: RuleGroupTypeAny) => void;
  schema: Ref<Schema<F, O> | undefined>;
  actions: Ref<QueryActions | undefined>;
  rootGroup: Ref<RuleGroupTypeAny>;
  translations: Ref<TranslationsFull>;
  wrapperClassName: Ref<string>;
  dndEnabledAttr: Ref<string>;
  inlineCombinatorsAttr: Ref<string>;
  queryDisabled: boolean;
  rootGroupDisabled: ComputedRef<boolean>;
  rqbContext: Ref<{
    schema: Ref<Schema<F, O> | undefined>;
    actions: Ref<QueryActions | undefined>;
    translations: Ref<TranslationsFull>;
    queryRef: Ref<RG | null>;
    dispatch: (q: RuleGroupTypeAny) => void;
  }>;
}

export function useQueryBuilderSchema<
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  propsSource: MaybeRefOrGetter<
    QueryBuilderProps<RG, F, O, C> & {
      controlElements?: Partial<Controls<F, O>>;
      controlClassnames?: Partial<Classnames>;
      onUpdateModelValue?: (query: RG) => void;
    }
  >
): UseQueryBuilderSchemaReturn<RG, F, O, C> {
  const props = computed(() => toValue(propsSource));
  const qbId = ref(generateID()).value;
  const queryProp = computed(() => props.value.query ?? props.value.modelValue);
  const defaultQueryProp = computed(() => props.value.defaultQuery);
  const controlElements = computed(() => ({
    ...(props.value.controlElements ?? {}),
  })) as Ref<Controls<F, O>>;
  const controlClassnames = computed(() => ({
    ...(props.value.controlClassnames ?? {}),
  }));

  const translations = computed(() =>
    mergeAnyTranslations(props.value.translations ?? {}, defaultTranslations)
  ) as Ref<TranslationsFull>;

  const fieldsResult = computed(() =>
    prepareOptionList({
      optionList: props.value.fields,
      placeholder: translations.value.fields,
      autoSelectOption: props.value.autoSelectField ?? true,
      baseOption: props.value.baseField,
    })
  );
  const fields = computed(() => fieldsResult.value.optionList as FullOptionList<F>);
  const fieldMap = computed(() => fieldsResult.value.optionsMap ?? {});
  const combinators = computed(
    () =>
      prepareOptionList({
        optionList: props.value.combinators ?? (defaultCombinators as FullOptionList<C>),
        baseOption: props.value.baseCombinator,
        autoSelectOption: true,
      }).optionList as FullOptionList<C>
  );
  const operators = computed(
    () =>
      prepareOptionList({
        optionList: props.value.operators ?? (defaultOperators as FullOptionList<O>),
        placeholder: translations.value.operators,
        baseOption: props.value.baseOperator,
        autoSelectOption: props.value.autoSelectOperator ?? true,
      }).optionList as FullOptionList<O>
  );

  const getOperatorsMain = (field: string, meta: { fieldData: F }) =>
    prepareOptionList({
      optionList: (meta.fieldData as { operators?: FullOptionList<O> })?.operators ?? props.value.getOperators?.(field, meta) ?? operators.value,
      placeholder: translations.value.operators,
      baseOption: props.value.baseOperator,
      autoSelectOption: props.value.autoSelectOperator ?? true,
    }).optionList as FullOptionList<O>;

  const getRuleDefaultOperator = (field: string): string => {
    const fd = fieldMap.value[field as keyof typeof fieldMap.value] as F | undefined;
    if (fd?.defaultOperator) return fd.defaultOperator as string;
    if (props.value.getDefaultOperator)
      return typeof props.value.getDefaultOperator === 'function'
        ? props.value.getDefaultOperator(field, { fieldData: fd as F })
        : (props.value.getDefaultOperator as string);
    return (getFirstOption(getOperatorsMain(field, { fieldData: fd as F })) ?? '') as string;
  };

  const getValueEditorTypeMain = (field: string, operator: string, meta: { fieldData: F }) =>
    (meta.fieldData as { valueEditorType?: string | ((op: string) => string) })?.valueEditorType != null
      ? typeof (meta.fieldData as { valueEditorType: (op: string) => string }).valueEditorType === 'function'
        ? (meta.fieldData as { valueEditorType: (op: string) => string }).valueEditorType(operator)
        : (meta.fieldData as { valueEditorType: string }).valueEditorType
      : props.value.getValueEditorType?.(field, operator, meta) ?? 'text';

  const getValueSourcesMain = (field: string, operator: string, meta?: { fieldData: F }) =>
    getValueSourcesUtil(fieldMap.value[field as keyof typeof fieldMap.value] as F, operator, props.value.getValueSources);

  const getMatchModesMain = (field: string, meta?: { fieldData: F }) =>
    getMatchModesUtil(fieldMap.value[field as keyof typeof fieldMap.value] as F, props.value.getMatchModes);

  const getValuesMain = (field: string, operator: string, meta: { fieldData: F }) =>
    prepareOptionList({
      optionList: (meta.fieldData as { values?: FullOptionList<unknown> })?.values ?? props.value.getValues?.(field, operator, meta) ?? [],
      placeholder: translations.value.values,
      autoSelectOption: props.value.autoSelectValue ?? true,
    }).optionList;

  const getRuleDefaultValue = (r: RuleType): unknown => {
    const fieldData = (fieldMap.value[r.field as keyof typeof fieldMap.value] ?? {}) as F;
    if (fieldData?.defaultValue != null) return fieldData.defaultValue;
    if (props.value.getDefaultValue) return props.value.getDefaultValue(r, { fieldData });
    const vals = getValuesMain(r.field, r.operator, { fieldData });
    if (r.valueSource === 'field') {
      const filtered = filterFieldsByComparator(fieldData, fields.value, r.operator);
      return filtered.length > 0 ? getFirstOption(filtered) : '';
    }
    if (vals.length > 0) {
      const editorType = getValueEditorTypeMain(r.field, r.operator, { fieldData });
      if (editorType === 'checkbox') return false;
      return getFirstOption(vals);
    }
    return '';
  };

  const idGenerator = props.value.idGenerator ?? generateID;
  const createRule = (): RuleType => {
    const field = (getFirstOption(fields.value) ?? (typeof props.value.getDefaultField === 'function' ? props.value.getDefaultField(fields.value) : props.value.getDefaultField ?? '')) as string;
    const operator = getRuleDefaultOperator(field);
    const valueSource = getFirstOption(getValueSourcesMain(field, operator, { fieldData: getOption(fields.value, field) as F })) ?? 'value';
    const newRule: RuleType = {
      id: idGenerator(),
      field,
      operator,
      valueSource,
      value: '',
    } as RuleType;
    return { ...newRule, value: getRuleDefaultValue(newRule) };
  };

  const createRuleGroup = (ic?: boolean): RG => {
    const ind = ic ?? false;
    if (ind) {
      return {
        id: idGenerator(),
        rules: (props.value.addRuleToNewGroups ? [createRule()] : []) as RG['rules'],
        not: false,
      } as RG;
    }
    return {
      id: idGenerator(),
      rules: (props.value.addRuleToNewGroups ? [createRule()] : []) as RG['rules'],
      combinator: (getFirstOption(combinators.value) ?? '') as string,
      not: false,
    } as RG;
  };

  const initialQuery = computed(() => {
    const q = queryProp.value ?? defaultQueryProp.value;
    if (!q) return prepareRuleGroup(createRuleGroup() as RuleGroupTypeAny, { idGenerator }) as RG;
    return (q.id ? q : prepareRuleGroup(q as RuleGroupTypeAny, { idGenerator })) as RG;
  });

  const queryRef = ref<RG | null>(initialQuery.value) as Ref<RG | null>;

  watch(
    queryProp,
    (v) => {
      if (v != null && v !== queryRef.value) queryRef.value = v as RG;
    },
    { immediate: true }
  );

  const onUpdateModelValue = props.value.onUpdateModelValue ?? (() => {});
  const dispatchQuery = (newQuery: RuleGroupTypeAny) => {
    queryRef.value = newQuery as RG;
    onUpdateModelValue(newQuery as RG);
    props.value.onQueryChange?.(newQuery as RG);
  };

  const getQuery = () => queryRef.value;

  const disabledPaths = computed(() =>
    Array.isArray(props.value.disabled) ? props.value.disabled : defaultDisabledPaths
  );
  const queryDisabled = props.value.disabled === true;
  const rootGroup = computed(() => queryRef.value ?? (prepareRuleGroup(createRuleGroup() as RuleGroupTypeAny, { idGenerator }) as RG));
  const rootGroupDisabledRef = computed(
    () => rootGroup.value?.disabled === true || disabledPaths.value.some((p: Path) => p.length === 0)
  );

  const onRuleAdd = (rule: RuleType, parentPath: Path) => {
    const queryLocal = getQuery();
    if (!queryLocal) return;
    if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) return;
    const next = props.value.onAddRule?.(rule, parentPath, queryLocal as RG) ?? true;
    const newRule = next === true ? rule : next;
    const newQuery = add(queryLocal as RuleGroupTypeAny, newRule, parentPath, {
      combinators: combinators.value,
      idGenerator,
    });
    dispatchQuery(newQuery);
  };

  const onGroupAdd = (ruleGroup: RG, parentPath: Path) => {
    if (parentPath.length >= (props.value.maxLevels ?? Infinity)) return;
    const queryLocal = getQuery();
    if (!queryLocal) return;
    if (pathIsDisabled(parentPath, queryLocal) || queryDisabled) return;
    const next = props.value.onAddGroup?.(ruleGroup, parentPath, queryLocal) ?? true;
    const newGroup = next === true ? ruleGroup : next;
    const newQuery = add(queryLocal as RuleGroupTypeAny, newGroup, parentPath, {
      combinators: combinators.value,
      idGenerator,
    });
    dispatchQuery(newQuery);
  };

  const onPropChange = (prop: UpdateableProperties, value: unknown, path: Path) => {
    const queryLocal = getQuery();
    if (!queryLocal) return;
    if ((pathIsDisabled(path, queryLocal) && prop !== 'disabled') || queryDisabled) return;
    const newQuery = update(queryLocal as RuleGroupTypeAny, prop, value, path, {
      resetOnFieldChange: props.value.resetOnFieldChange ?? true,
      resetOnOperatorChange: props.value.resetOnOperatorChange ?? false,
      getRuleDefaultOperator,
      getValueSources: getValueSourcesMain as (field: string, operator: string) => ValueSourceFullOptions,
      getRuleDefaultValue,
      getMatchModes: getMatchModesMain as (field: string) => MatchModeOptions,
    });
    dispatchQuery(newQuery);
  };

  const onRuleOrGroupRemove = (path: Path) => {
    const queryLocal = getQuery();
    if (!queryLocal) return;
    if (pathIsDisabled(path, queryLocal) || queryDisabled) return;
    const node = findPath(path, queryLocal as RuleGroupTypeAny);
    if (node && (props.value.onRemove?.(node, path, queryLocal as RG) ?? true)) {
      dispatchQuery(remove(queryLocal as RuleGroupTypeAny, path));
    }
  };

  const moveRule = (oldPath: Path, newPath: Path | 'up' | 'down', clone?: boolean) => {
    const queryLocal = getQuery();
    if (!queryLocal) return;
    if (pathIsDisabled(oldPath, queryLocal) || queryDisabled) return;
    const nextQuery = move(queryLocal as RuleGroupTypeAny, oldPath, newPath, {
      clone,
      combinators: combinators.value,
      idGenerator,
    });
    dispatchQuery(nextQuery);
  };

  const independentCombinators = computed(() => isRuleGroupTypeIC(rootGroup.value));
  const validationResult = computed(() =>
    typeof props.value.validator === 'function' ? props.value.validator(rootGroup.value) : {}
  );
  const validationMap = computed(() =>
    typeof validationResult.value === 'boolean' ? defaultValidationMap : (validationResult.value as Record<string, unknown>)
  );

  const schema = computed((): Schema<F, O> => ({
    qbId,
    fields: fields.value,
    fieldMap: fieldMap.value as Schema<F, O>['fieldMap'],
    classNames: controlClassnames.value as Schema<F, O>['classNames'],
    combinators: combinators.value,
    controls: controlElements.value,
    createRule,
    createRuleGroup: (ic?: boolean) => createRuleGroup(ic ?? independentCombinators.value) as RuleGroupTypeAny,
    dispatchQuery,
    getQuery: () => getQuery() as RuleGroupTypeAny,
    getOperators: getOperatorsMain as Schema<F, O>['getOperators'],
    getValueEditorType: getValueEditorTypeMain as Schema<F, O>['getValueEditorType'],
    getValueEditorSeparator: (props.value.getValueEditorSeparator as Schema<F, O>['getValueEditorSeparator']) ?? (() => null),
    getValueSources: getValueSourcesMain as Schema<F, O>['getValueSources'],
    getInputType: (props.value.getInputType as Schema<F, O>['getInputType']) ?? (() => 'text'),
    getValues: getValuesMain as Schema<F, O>['getValues'],
    getMatchModes: getMatchModesMain as Schema<F, O>['getMatchModes'],
    getSubQueryBuilderProps: (props.value.getSubQueryBuilderProps as Schema<F, O>['getSubQueryBuilderProps']) ?? (() => ({})),
    getRuleClassname: (props.value.getRuleClassname as Schema<F, O>['getRuleClassname']) ?? (() => ''),
    getRuleGroupClassname: (props.value.getRuleGroupClassname as Schema<F, O>['getRuleGroupClassname']) ?? (() => ''),
    accessibleDescriptionGenerator: props.value.accessibleDescriptionGenerator ?? (() => ''),
    showCombinatorsBetweenRules: !!props.value.showCombinatorsBetweenRules,
    showNotToggle: !!props.value.showNotToggle,
    showShiftActions: !!props.value.showShiftActions,
    showCloneButtons: !!props.value.showCloneButtons,
    showLockButtons: !!props.value.showLockButtons,
    showMuteButtons: !!props.value.showMuteButtons,
    autoSelectField: props.value.autoSelectField ?? true,
    autoSelectOperator: props.value.autoSelectOperator ?? true,
    autoSelectValue: props.value.autoSelectValue ?? true,
    addRuleToNewGroups: !!props.value.addRuleToNewGroups,
    enableDragAndDrop: !!props.value.enableDragAndDrop,
    validationMap: validationMap.value as Schema<F, O>['validationMap'],
    independentCombinators: independentCombinators.value,
    listsAsArrays: !!props.value.listsAsArrays,
    parseNumbers: props.value.parseNumbers ?? false,
    disabledPaths: disabledPaths.value,
    suppressStandardClassnames: !!props.value.suppressStandardClassnames,
    maxLevels: (props.value.maxLevels ?? 0) > 0 ? Number(props.value.maxLevels) : Infinity,
  }));

  const actions = computed(
    (): QueryActions => ({
      moveRule,
      onGroupAdd,
      onGroupRemove: onRuleOrGroupRemove,
      onPropChange,
      onRuleAdd,
      onRuleRemove: onRuleOrGroupRemove,
      groupRule: () => {},
    })
  );

  const wrapperClassName = computed(() =>
    clsx(
      props.value.suppressStandardClassnames || standardClassnames.queryBuilder,
      controlClassnames.value?.queryBuilder,
      queryDisabled && controlClassnames.value?.disabled,
      typeof validationResult.value === 'boolean' && validationResult.value && controlClassnames.value?.valid,
      typeof validationResult.value === 'boolean' && !validationResult.value && controlClassnames.value?.invalid,
      { [standardClassnames.disabled]: queryDisabled }
    )
  );

  const rqbContext = computed(() => ({
    schema,
    actions,
    translations,
    queryRef,
    dispatch: dispatchQuery,
  }));

  return {
    queryRef,
    dispatchQuery,
    schema,
    actions,
    rootGroup: rootGroup as Ref<RuleGroupTypeAny>,
    translations,
    wrapperClassName,
    dndEnabledAttr: computed(() => (props.value.enableDragAndDrop ? 'enabled' : 'disabled')),
    inlineCombinatorsAttr: computed(() =>
      independentCombinators.value || props.value.showCombinatorsBetweenRules ? 'enabled' : 'disabled'
    ),
    queryDisabled,
    rootGroupDisabled: rootGroupDisabledRef,
    rqbContext: rqbContext as UseQueryBuilderSchemaReturn<RG, F, O, C>['rqbContext'],
  };
}
