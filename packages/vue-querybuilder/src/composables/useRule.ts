import type {
  ActionElementEventHandler,
  FlexibleOptionList,
  FullField,
  FullOperator,
  FullOption,
  InputType,
  MatchModeOptions,
  Option,
  OptionList,
  RuleType,
  ValidationResult,
  ValueChangeEventHandler,
  ValueEditorType,
  ValueSourceFullOptions,
  ValueSources,
} from '@react-querybuilder/core';
import {
  clsx,
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
  isFlexibleOptionArray,
  isFlexibleOptionGroupArray,
  isPojo,
  lc,
  standardClassnames,
  toFullOptionList,
} from '@react-querybuilder/core';
import { computed, toRef } from 'vue';
import { useDeprecatedProps } from './useDeprecatedProps';
import { useFields } from './useFields';
import { useReactDndWarning } from './useReactDndWarning';
import { useStopEventPropagation } from './useStopEventPropagation';
import type { RuleProps, ShiftActionsProps, TranslationsFull } from '../types';

const defaultSubproperties: FullOption[] = [{ name: '', value: '', label: '' }];

/* oxlint-disable typescript/no-explicit-any */
export interface UseRule extends RuleProps {
  classNames: {
    shiftActions: string;
    dragHandle: string;
    fields: string;
    matchMode: string;
    matchThreshold: string;
    operators: string;
    valueSource: string;
    value: string;
    cloneRule: string;
    lockRule: string;
    muteRule: string;
    removeRule: string;
  };
  muted?: boolean;
  parentMuted?: boolean;
  cloneRule: ActionElementEventHandler;
  fieldData: FullField<string, string, string, FullOption, FullOption>;
  generateOnChangeHandler: (
    prop: Exclude<keyof RuleType, 'id' | 'path'>
  ) => ValueChangeEventHandler;
  onChangeValueSource: ValueChangeEventHandler;
  onChangeField: ValueChangeEventHandler;
  onChangeMatchMode: ValueChangeEventHandler;
  onChangeOperator: ValueChangeEventHandler;
  onChangeValue: ValueChangeEventHandler;
  hideValueControls: boolean;
  inputType: InputType | null;
  matchModes: MatchModeOptions;
  operators: OptionList<FullOperator>;
  outerClassName: string;
  removeRule: ActionElementEventHandler;
  shiftRuleUp: (event?: MouseEvent, _context?: any) => void;
  shiftRuleDown: (event?: MouseEvent, _context?: any) => void;
  subproperties: ReturnType<typeof useFields<FullField>>;
  subQueryBuilderProps: Record<string, unknown>;
  toggleLockRule: ActionElementEventHandler;
  toggleMuteRule: ActionElementEventHandler;
  validationResult: boolean | ValidationResult;
  valueEditorSeparator: any;
  valueEditorType: ValueEditorType;
  values: FlexibleOptionList<Option>;
  valueSourceOptions: ValueSourceFullOptions;
  valueSources: ValueSources;
}
/* oxlint-enable typescript/no-explicit-any */

/**
 * Prepares all values and methods used by the {@link Rule} component.
 *
 * @group Composables
 */
export const useRule = (props: RuleProps): UseRule => {
  // Use toRef to ensure path is always reactive and updates when props.path changes
  const pathRef = toRef(props, 'path');
  const {
    id,
    rule: ruleProp,
    schema: {
      classNames: classNamesProp,
      fields,
      fieldMap,
      getInputType,
      getMatchModes,
      getOperators,
      getSubQueryBuilderProps,
      getValueEditorType,
      getValueEditorSeparator,
      getValueSources,
      getValues,
      validationMap,
      enableDragAndDrop,
      getRuleClassname,
      suppressStandardClassnames,
    },
    actions: { moveRule, onPropChange, onRuleRemove },
    disabled: disabledProp,
    parentDisabled,
    parentMuted,
    shiftUpDisabled,
    shiftDownDisabled,
    field: fieldProp,
    operator: operatorProp,
    value: valueProp,
    valueSource: valueSourceProp,
    // Drag-and-drop
    dropEffect = 'move',
    groupItems = false,
    dragMonitorId = '',
    dropMonitorId = '',
    dndRef = null,
    dragRef = null,
    isDragging = false,
    isOver = false,
    dropNotAllowed = false,
  } = props;

  useDeprecatedProps('rule', !ruleProp);

  useReactDndWarning(enableDragAndDrop, !!(dragMonitorId || dropMonitorId || dndRef || dragRef));

  const disabled = computed(() => !!parentDisabled || !!disabledProp).value;
  const muted = computed(() => !!parentMuted || !!ruleProp?.muted).value;

  const rule = computed(() =>
    ruleProp ?? {
      id,
      field: fieldProp ?? /* istanbul ignore next */ '',
      operator: operatorProp ?? /* istanbul ignore next */ '',
      value: valueProp,
      valueSource: valueSourceProp,
    }
  ).value;

  const classNames = computed(() => ({
    shiftActions: clsx(
      suppressStandardClassnames || standardClassnames.shiftActions,
      classNamesProp.shiftActions
    ),
    dragHandle: clsx(
      suppressStandardClassnames || standardClassnames.dragHandle,
      classNamesProp.dragHandle
    ),
    fields: clsx(
      suppressStandardClassnames || standardClassnames.fields,
      classNamesProp.valueSelector,
      classNamesProp.fields
    ),
    matchMode: clsx(
      suppressStandardClassnames || standardClassnames.matchMode,
      classNamesProp.valueSelector,
      classNamesProp.matchMode
    ),
    matchThreshold: clsx(
      suppressStandardClassnames || standardClassnames.matchThreshold,
      classNamesProp.valueSelector,
      classNamesProp.matchThreshold
    ),
    operators: clsx(
      suppressStandardClassnames || standardClassnames.operators,
      classNamesProp.valueSelector,
      classNamesProp.operators
    ),
    valueSource: clsx(
      suppressStandardClassnames || standardClassnames.valueSource,
      classNamesProp.valueSelector,
      classNamesProp.valueSource
    ),
    value: clsx(suppressStandardClassnames || standardClassnames.value, classNamesProp.value),
    cloneRule: clsx(
      suppressStandardClassnames || standardClassnames.cloneRule,
      classNamesProp.actionElement,
      classNamesProp.cloneRule
    ),
    lockRule: clsx(
      suppressStandardClassnames || standardClassnames.lockRule,
      classNamesProp.actionElement,
      classNamesProp.lockRule
    ),
    muteRule: clsx(
      suppressStandardClassnames || standardClassnames.muteRule,
      classNamesProp.actionElement,
      classNamesProp.muteRule
    ),
    removeRule: clsx(
      suppressStandardClassnames || standardClassnames.removeRule,
      classNamesProp.actionElement,
      classNamesProp.removeRule
    ),
    valueListItem: clsx(
      suppressStandardClassnames || standardClassnames.valueListItem,
      classNamesProp.valueListItem
    ),
  })).value;

  const getChangeHandler = (
    // oxlint-disable-next-line typescript/no-explicit-any
    prop: Exclude<keyof RuleType, 'id' | 'path'>
  ) => (value: any, context?: any) => {
    if (!disabled) {
      onPropChange(prop, value, pathRef.value, context);
    }
  };

  const onChangeField = computed(() => getChangeHandler('field')).value;
  const onChangeOperator = computed(() => getChangeHandler('operator')).value;
  const onChangeMatchMode = computed(() => getChangeHandler('match')).value;
  const onChangeValueSource = computed(() => getChangeHandler('valueSource')).value;
  const onChangeValue = computed(() => getChangeHandler('value')).value;

  const cloneRule: ActionElementEventHandler = (_event, context) => {
    if (!disabled) {
      const path = pathRef.value;
      const newPath = [...getParentPath(path), path.at(-1)! + 1];
      moveRule(path, newPath, true, context);
    }
  };

  const toggleLockRule: ActionElementEventHandler = (_event, context) =>
    onPropChange('disabled', !disabled, pathRef.value, context);

  const toggleMuteRule: ActionElementEventHandler = (_event, context) =>
    onPropChange('muted', !rule.muted, pathRef.value, context);

  const removeRule: ActionElementEventHandler = (_event, _context) => {
    if (!disabled) {
      onRuleRemove(pathRef.value);
    }
  };

  const shiftRuleUp: ActionElementEventHandler = (event, context) => {
    if (!disabled && !shiftUpDisabled) {
      moveRule(pathRef.value, 'up', (event as MouseEvent)?.altKey, context);
    }
  };

  const shiftRuleDown: ActionElementEventHandler = (event, context) => {
    if (!disabled && !shiftDownDisabled) {
      moveRule(pathRef.value, 'down', (event as MouseEvent)?.altKey, context);
    }
  };

  const fieldData: FullField = computed(
    () => fieldMap?.[rule.field] ?? { name: rule.field, value: rule.field, label: rule.field }
  ).value;
  
  const inputType = computed(
    () => fieldData.inputType ?? getInputType(rule.field, rule.operator, { fieldData })
  ).value;
  
  const matchModes = computed(() => getMatchModes(rule.field, { fieldData })).value;
  
  const operators = computed(() => getOperators(rule.field, { fieldData })).value;
  
  const operatorObject = computed(() => getOption(operators, rule.operator)).value;
  
  const arity = operatorObject?.arity;
  const hideValueControls =
    (typeof arity === 'string' && arity === 'unary') || (typeof arity === 'number' && arity < 2);
  
  const valueSourceOptions = computed(() => {
    const configuredVSs = getValueSources(rule.field, rule.operator, { fieldData });
    if (rule.valueSource && !getOption(configuredVSs, rule.valueSource)) {
      return [
        ...configuredVSs,
        { name: rule.valueSource, value: rule.valueSource, label: rule.valueSource },
      ] as ValueSourceFullOptions;
    }
    return configuredVSs;
  }).value;
  
  const valueSources = computed(() => valueSourceOptions.map(({ value }) => value) as ValueSources)
    .value;
  
  const valueEditorType = computed(() =>
    rule.valueSource === 'field'
      ? 'select'
      : getValueEditorType(rule.field, rule.operator, { fieldData })
  ).value;
  
  const valueEditorSeparator = computed(() =>
    getValueEditorSeparator(rule.field, rule.operator, { fieldData })
  ).value;
  
  const values = computed(() => {
    const v =
      rule.valueSource === 'field'
        ? filterFieldsByComparator(fieldData, fields, rule.operator)
        : getValues(rule.field, rule.operator, { fieldData });
    return isFlexibleOptionArray(v) || isFlexibleOptionGroupArray(v) ? toFullOptionList(v) : v;
  }).value;
  
  const subQueryBuilderProps = computed(
    () => getSubQueryBuilderProps(rule.field, { fieldData }) as Record<string, unknown>
  ).value;
  
  const subproperties = useFields({
    translations: props.translations as TranslationsFull,
    fields: fieldData.subproperties ?? subQueryBuilderProps.fields ?? defaultSubproperties,
    autoSelectField: props.schema.autoSelectField || !!fieldData.subproperties,
  });

  const validationResult = computed(
    () =>
      validationMap[id ?? /* istanbul ignore next */ ''] ??
      (typeof fieldData.validator === 'function' ? fieldData.validator(rule) : null)
  ).value;
  
  const validationClassName = computed(() => getValidationClassNames(validationResult)).value;
  
  const fieldBasedClassName = fieldData?.className ?? '';
  const operatorBasedClassName = operatorObject?.className ?? '';
  const hasSubQuery = matchModes.length > 0;

  const outerClassName = computed(() =>
    clsx(
      getRuleClassname(rule, { fieldData }),
      fieldBasedClassName,
      operatorBasedClassName,
      suppressStandardClassnames || standardClassnames.rule,
      classNamesProp.rule,
      // custom conditional classes
      disabled && classNamesProp.disabled,
      muted && classNamesProp.muted,
      isDragging && classNamesProp.dndDragging,
      isOver && classNamesProp.dndOver,
      isOver && dropEffect === 'copy' && classNamesProp.dndCopy,
      isOver && groupItems && classNamesProp.dndGroup,
      dropNotAllowed && classNamesProp.dndDropNotAllowed,
      hasSubQuery && classNamesProp.hasSubQuery,
      // standard conditional classes
      suppressStandardClassnames || {
        [standardClassnames.disabled]: disabled,
        [standardClassnames.muted]: muted,
        [standardClassnames.dndDragging]: isDragging,
        [standardClassnames.dndOver]: isOver,
        [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
        [standardClassnames.dndGroup]: isOver && groupItems,
        [standardClassnames.dndDropNotAllowed]: dropNotAllowed,
        [standardClassnames.hasSubQuery]: hasSubQuery,
      },
      validationClassName
    )
  ).value;

  return {
    ...props,
    classNames,
    cloneRule,
    disabled,
    dndRef,
    dragMonitorId,
    dragRef,
    dropMonitorId,
    fieldData,
    generateOnChangeHandler: getChangeHandler,
    onChangeField,
    onChangeMatchMode,
    onChangeOperator,
    onChangeValueSource,
    onChangeValue,
    hideValueControls,
    inputType,
    matchModes,
    muted,
    operators,
    outerClassName,
    removeRule,
    rule,
    shiftRuleUp,
    shiftRuleDown,
    subproperties,
    subQueryBuilderProps,
    toggleLockRule,
    toggleMuteRule,
    validationResult,
    valueEditorSeparator,
    valueEditorType,
    values,
    valueSourceOptions,
    valueSources,
  };
};
