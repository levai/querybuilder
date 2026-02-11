/**
 * Rule composable — inject queryRef + path, compute rule via findPath.
 */
// @ts-nocheck - context schema ref typing
import {
  clsx,
  findPath,
  getOption,
  isRuleGroup,
  standardClassnames,
  filterFieldsByComparator,
  getValueSourcesUtil,
} from '@react-querybuilder/core';
import type { Path, RuleType } from '@react-querybuilder/core';
import { computed, inject } from 'vue';
import { QUERY_REF_KEY, DISPATCH_KEY, QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import type { Schema } from '../types';
import { getValidationClassNames } from '@react-querybuilder/core';

export interface UseRulePathOptions {
  path: Path;
  disabled?: boolean;
  parentDisabled?: boolean;
  parentMuted?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  context?: unknown;
}

export function useRule(options: UseRulePathOptions) {
  const queryRef = inject(QUERY_REF_KEY);
  const dispatch = inject(DISPATCH_KEY);
  const contextRef = inject(QUERY_BUILDER_CONTEXT_KEY);
  if (!queryRef || !dispatch || !contextRef) throw new Error('Rule must be used within QueryBuilder');

  const pathRef = computed(() => options.path);
  const schemaRef = computed(() => {
    const ctx = contextRef.value as { schema?: { value?: Schema } };
    return ctx?.schema?.value ?? (contextRef.value as { schema?: Schema })?.schema;
  });
  const actionsRef = computed(() => (contextRef.value as { actions?: { value?: unknown } })?.actions?.value ?? (contextRef.value as { actions?: unknown })?.actions);

  const ruleFromQuery = computed((): RuleType | null => {
    const q = queryRef.value;
    if (!q || !isRuleGroup(q)) return null;
    const node = findPath(pathRef.value, q);
    return node && !isRuleGroup(node) ? (node as RuleType) : null;
  });

  const rule = computed(() => ruleFromQuery.value);
  const disabledProp = computed(() => rule.value?.disabled);
  const pathDisabled = computed(() => options.disabled ?? false);
  const parentDisabled = computed(() => options.parentDisabled ?? false);
  const parentMuted = computed(() => options.parentMuted ?? false);
  const disabled = computed(() => !!parentDisabled.value || !!pathDisabled.value || !!disabledProp.value);
  const muted = computed(() => !!parentMuted.value || !!rule.value?.muted);

  const fieldMap = computed(() => schemaRef.value?.fieldMap ?? {});
  const fields = computed(() => schemaRef.value?.fields ?? []);
  const fieldData = computed(() => {
    const r = rule.value;
    if (!r) return { name: '', value: '', label: '' };
    const fd = fieldMap.value[r.field as keyof typeof fieldMap.value];
    return fd ?? { name: r.field, value: r.field, label: r.field };
  });

  const operators = computed(() => {
    const getOp = schemaRef.value?.getOperators ?? (() => []);
    return getOp(rule.value?.field ?? '', { fieldData: fieldData.value });
  });
  const values = computed(() => {
    const r = rule.value;
    const getVal = schemaRef.value?.getValues ?? (() => []);
    if (!r) return [];
    if (r.valueSource === 'field')
      return filterFieldsByComparator(fieldData.value, fields.value, r.operator);
    return getVal(r.field, r.operator, { fieldData: fieldData.value });
  });
  const valueEditorType = computed(() => {
    const getVet = schemaRef.value?.getValueEditorType ?? (() => 'text');
    return rule.value?.valueSource === 'field' ? 'select' : getVet(rule.value?.field ?? '', rule.value?.operator ?? '', { fieldData: fieldData.value });
  });
  const inputType = computed(() => {
    const getIt = schemaRef.value?.getInputType ?? (() => 'text');
    return getIt(rule.value?.field ?? '', rule.value?.operator ?? '', { fieldData: fieldData.value });
  });
  const valueEditorSeparator = computed(() => {
    const getSep = schemaRef.value?.getValueEditorSeparator ?? (() => null);
    return getSep(rule.value?.field ?? '', rule.value?.operator ?? '', { fieldData: fieldData.value });
  });
  const hideValueControls = computed(() => {
    const ops = operators.value;
    const op = Array.isArray(ops)
    ? (ops as { name?: string }[]).find((o) => o?.name === (rule.value?.operator ?? ''))
    : undefined;
    const arity = (op as { arity?: number | string })?.arity;
    return (typeof arity === 'string' && arity === 'unary') || (typeof arity === 'number' && arity < 2);
  });

  const valueSourceOptions = computed(() => {
    const getVs = schemaRef.value?.getValueSources;
    const opts = getValueSourcesUtil(fieldData.value, rule.value?.operator ?? '', getVs);
    const vs = rule.value?.valueSource;
    if (vs && !opts.some((o: { value?: string }) => o?.value === vs))
      return [...opts, { name: vs, value: vs, label: vs }];
    return opts;
  });
  const valueSources = computed(() => valueSourceOptions.value.map((o: { value?: string }) => o?.value ?? o?.name) as string[]);

  const matchModes = computed(() => {
    const getM = schemaRef.value?.getMatchModes ?? (() => []);
    return getM(rule.value?.field ?? '', { fieldData: fieldData.value });
  });

  const subQueryBuilderProps = computed(() => {
    const getSub = schemaRef.value?.getSubQueryBuilderProps ?? (() => ({}));
    return (getSub(rule.value?.field ?? '', { fieldData: fieldData.value }) ?? {}) as Record<string, unknown>;
  });
  const subpropertiesFields = computed(() => {
    const fd = fieldData.value as { subproperties?: unknown[] };
    const subProps = subQueryBuilderProps.value as { fields?: unknown[] };
    const defaultSub: unknown[] = [{ name: '', value: '', label: '' }];
    return fd?.subproperties ?? subProps?.fields ?? defaultSub;
  });

  const onPropChange = (prop: string, value: unknown, path: Path, context?: unknown) => {
    const allow = !disabled.value || prop === 'disabled' || prop === 'muted';
    if (allow) (actionsRef.value as { onPropChange?: (p: string, v: unknown, path: Path, ctx?: unknown) => void })?.onPropChange?.(prop, value, path, context);
  };
  const onRuleRemove = (path: Path) => {
    if (!disabled.value) (actionsRef.value as { onRuleRemove?: (p: Path) => void })?.onRuleRemove?.(path);
  };
  const moveRule = (from: Path, to: Path | 'up' | 'down', clone?: boolean, context?: unknown) => {
    if (!disabled.value) (actionsRef.value as { moveRule?: (a: Path, b: Path | 'up' | 'down', c?: boolean, d?: unknown) => void })?.moveRule?.(from, to, clone, context);
  };

  const getChangeHandler = (prop: string) => (value: unknown, context?: unknown) => onPropChange(prop, value, pathRef.value, context);
  const onChangeField = (v: unknown, ctx?: unknown) => getChangeHandler('field')(v, ctx);
  const onChangeOperator = (v: unknown, ctx?: unknown) => getChangeHandler('operator')(v, ctx);
  const onChangeValue = (v: unknown, ctx?: unknown) => getChangeHandler('value')(v, ctx);
  const onChangeValueSource = (v: unknown, ctx?: unknown) => getChangeHandler('valueSource')(v, ctx);
  const onChangeMatchMode = (v: unknown, ctx?: unknown) => getChangeHandler('match')(v, ctx);

  const toggleLockRule = () => onPropChange('disabled', !disabled.value, pathRef.value);
  const toggleMuteRule = () => onPropChange('muted', !rule.value?.muted, pathRef.value);
  const removeRule = () => onRuleRemove(pathRef.value);
  const cloneRule = (_e?: MouseEvent, context?: unknown) => {
    if (!disabled.value) moveRule(pathRef.value, [...pathRef.value.slice(0, -1), pathRef.value[pathRef.value.length - 1] + 1], true, context);
  };
  const shiftUpDisabled = computed(() => options.shiftUpDisabled ?? false);
  const shiftDownDisabled = computed(() => options.shiftDownDisabled ?? false);
  const shiftRuleUp = () => { if (!disabled.value && !shiftUpDisabled.value) moveRule(pathRef.value, 'up'); };
  const shiftRuleDown = () => { if (!disabled.value && !shiftDownDisabled.value) moveRule(pathRef.value, 'down'); };

  const classNamesProp = computed(() => (schemaRef.value?.classNames ?? {}) as Record<string, string>);
  const suppressStandardClassnames = computed(() => schemaRef.value?.suppressStandardClassnames ?? false);
  const validationMap = computed(() => schemaRef.value?.validationMap ?? {});
  const id = computed(() => rule.value?.id ?? '');
  const validationResult = computed(() => validationMap.value[id.value] ?? null);
  const validationClassName = computed(() => getValidationClassNames(validationResult.value));
  const getRuleClassnameFn = computed(() => schemaRef.value?.getRuleClassname ?? (() => ''));

  const classNames = computed(() => {
    const p = classNamesProp.value ?? {};
    return {
      shiftActions: clsx(standardClassnames.shiftActions, p.shiftActions),
      dragHandle: clsx(standardClassnames.dragHandle, p.dragHandle),
      fields: clsx(suppressStandardClassnames.value || standardClassnames.fields, p.valueSelector, p.fields),
      matchMode: clsx(suppressStandardClassnames.value || standardClassnames.matchMode, p.valueSelector, p.matchMode),
      matchThreshold: clsx(suppressStandardClassnames.value || standardClassnames.matchThreshold, p.valueSelector, p.matchThreshold),
      operators: clsx(suppressStandardClassnames.value || standardClassnames.operators, p.valueSelector, p.operators),
      value: clsx(suppressStandardClassnames.value || standardClassnames.value, p.value),
      valueListItem: clsx(suppressStandardClassnames.value || standardClassnames.valueListItem, p.valueListItem),
      valueSource: clsx(suppressStandardClassnames.value || standardClassnames.valueSource, p.valueSelector, p.valueSource),
      cloneRule: clsx(standardClassnames.cloneRule, p.actionElement, p.cloneRule),
      lockRule: clsx(suppressStandardClassnames.value || standardClassnames.lockRule, p.actionElement, p.lockRule),
      muteRule: clsx(standardClassnames.muteRule, p.actionElement, p.muteRule),
      removeRule: clsx(suppressStandardClassnames.value || standardClassnames.removeRule, p.actionElement, p.removeRule),
    };
  });

  const hasSubQuery = computed(() => (matchModes.value?.length ?? 0) > 0);
  const outerClassName = computed(() =>
    clsx(
      rule.value ? getRuleClassnameFn.value(rule.value as RuleType, { fieldData: fieldData.value }) : '',
      suppressStandardClassnames.value || standardClassnames.rule,
      hasSubQuery.value && (suppressStandardClassnames.value || standardClassnames.hasSubQuery),
      hasSubQuery.value && classNamesProp.value?.hasSubQuery,
      classNamesProp.value?.rule,
      disabled.value && classNamesProp.value?.disabled,
      muted.value && classNamesProp.value?.muted,
      validationClassName.value
    )
  );

  return {
    path: pathRef,
    id,
    rule,
    disabled,
    muted,
    parentDisabled,
    parentMuted,
    classNames,
    outerClassName,
    fieldData,
    operators,
    values,
    valueEditorType,
    inputType,
    valueEditorSeparator,
    hideValueControls,
    valueSourceOptions,
    valueSources,
    matchModes,
    onChangeField,
    onChangeOperator,
    onChangeValue,
    onChangeValueSource,
    onChangeMatchMode,
    toggleLockRule,
    toggleMuteRule,
    removeRule,
    cloneRule,
    shiftRuleUp,
    shiftRuleDown,
    shiftUpDisabled,
    shiftDownDisabled,
    schema: schemaRef,
    translations: computed(() => (contextRef.value as { translations?: { value?: unknown } })?.translations?.value ?? {}),
    subpropertiesFields,
    subQueryBuilderProps,
  };
}
