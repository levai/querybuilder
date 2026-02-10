import {
  clsx,
  filterFieldsByComparator,
  getOption,
  getParentPath,
  getValidationClassNames,
  isFlexibleOptionArray,
  isFlexibleOptionGroupArray,
  prepareOptionList,
  standardClassnames,
  toFullOptionList,
} from '@react-querybuilder/core';
import type {
  FullField,
  FullOption,
  FullOptionList,
  InputType,
  MatchModeOptions,
  Path,
  RuleType,
  ValidationResult,
  ValueEditorType,
  ValueSource,
  ValueSources,
  Placeholder
} from '@react-querybuilder/core';
import { computed, type ComputedRef, type Ref, unref } from 'vue';
import type { QueryBuilderContextValue } from '../types';

/** schema 支持 Ref 以便 inject 的 context 变化时保持响应式 */
export interface UseRuleProps {
  id?: string;
  path: Path;
  rule: RuleType;
  schema: Ref<QueryBuilderContextValue> | QueryBuilderContextValue;
  disabled?: boolean;
  parentDisabled?: boolean;
  parentMuted?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  field?: string;
  operator?: string;
  value?: unknown;
  valueSource?: ValueSource;
  dropEffect?: 'move' | 'copy';
  groupItems?: boolean;
  dragMonitorId?: string;
  dropMonitorId?: string;
  dndRef?: unknown;
  dragRef?: unknown;
  isDragging?: boolean;
  isOver?: boolean;
  dropNotAllowed?: boolean;
  context?: unknown;
}

export interface UseFields {
  defaultField: FullField;
  fields: FullOptionList<FullField>;
  fieldMap: Partial<Record<string, FullField>>;
}

function useFields(
  props: {
    translations: QueryBuilderContextValue['translations'];
    fields?: FullOptionList<FullField>;
    baseField?: Record<string, unknown>;
    autoSelectField: boolean;
  }
): UseFields {
  const {
    optionList: fields,
    optionsMap: fieldMap,
    defaultOption: defaultField,
  } = prepareOptionList({
    placeholder: (props.translations.fields ?? {}) as Placeholder,
    optionList: props.fields ?? [],
    autoSelectOption: props.autoSelectField,
    baseOption: props.baseField,
  });

  return { fields, fieldMap, defaultField };
}

export interface UseRule {
  classNames: ComputedRef<{
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
    valueListItem: string;
  }>;
  muted: ComputedRef<boolean>;
  cloneRule: (event?: MouseEvent, context?: unknown) => void;
  fieldData: ComputedRef<FullField>;
  generateOnChangeHandler: (
    prop: Exclude<keyof RuleType, 'id' | 'path'>
  ) => (value: unknown, context?: unknown) => void;
  onChangeValueSource: (value: unknown, context?: unknown) => void;
  onChangeField: (value: unknown, context?: unknown) => void;
  onChangeMatchMode: (value: unknown, context?: unknown) => void;
  onChangeOperator: (value: unknown, context?: unknown) => void;
  onChangeValue: (value: unknown, context?: unknown) => void;
  hideValueControls: ComputedRef<boolean>;
  inputType: ComputedRef<InputType | null>;
  matchModes: ComputedRef<MatchModeOptions>;
  operators: ComputedRef<FullOptionList<FullOption>>;
  outerClassName: ComputedRef<string>;
  removeRule: (event?: MouseEvent, context?: unknown) => void;
  shiftRuleUp: (event?: MouseEvent, context?: unknown) => void;
  shiftRuleDown: (event?: MouseEvent, context?: unknown) => void;
  subproperties: ComputedRef<UseFields>;
  subQueryBuilderProps: ComputedRef<Record<string, unknown>>;
  toggleLockRule: (event?: MouseEvent, context?: unknown) => void;
  toggleMuteRule: (event?: MouseEvent, context?: unknown) => void;
  validationResult: ComputedRef<boolean | ValidationResult | undefined>;
  valueEditorSeparator: ComputedRef<string | import('vue').VNode | null>;
  valueEditorType: ComputedRef<ValueEditorType>;
  values: ComputedRef<FullOptionList<FullOption>>;
  valueSourceOptions: ComputedRef<Array<FullOption & { value: ValueSource }>>;
  valueSources: ComputedRef<ValueSources>;
  rule: ComputedRef<RuleType>;
  disabled: ComputedRef<boolean>;
}

/**
 * Prepares all values and methods used by the Rule component.
 * schema 支持 Ref，保证 inject 的 context 更新时界面联动。
 */
export function useRule(props: UseRuleProps): UseRule {
  const schemaRef = computed(() => unref(props.schema));

  const disabled = computed(() => !!props.parentDisabled || !!props.disabled);
  const muted = computed(() => !!props.parentMuted || !!unref(props.rule)?.muted);

  const rule = computed(() => {
    const ruleProp = unref(props.rule);
    return (
      ruleProp ?? {
        id: props.id ?? '',
        field: props.field ?? '',
        operator: props.operator ?? '',
        value: props.value,
        valueSource: props.valueSource,
      }
    );
  });

  const classNames = computed(() => {
    const schema = schemaRef.value;
    const { classnames: classNamesProp, suppressStandardClassnames } = schema;
    return {
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
    };
  });

  const getChangeHandler = (prop: Exclude<keyof RuleType, 'id' | 'path'>) => {
    return (value: unknown, context?: unknown) => {
      if (!disabled.value) {
        schemaRef.value.actions.onPropChange(prop, value, props.path, context);
      }
    };
  };

  const onChangeField = getChangeHandler('field');
  const onChangeOperator = getChangeHandler('operator');
  const onChangeMatchMode = getChangeHandler('match');
  const onChangeValueSource = getChangeHandler('valueSource');
  const onChangeValue = getChangeHandler('value');

  const cloneRule = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      const newPath = [...getParentPath(props.path), props.path.at(-1)! + 1];
      schemaRef.value.actions.moveRule(props.path, newPath, true, context);
    }
  };

  const toggleLockRule = (event?: MouseEvent, context?: unknown) => {
    schemaRef.value.actions.onPropChange('disabled', !disabled.value, props.path, context);
  };

  const toggleMuteRule = (event?: MouseEvent, context?: unknown) => {
    schemaRef.value.actions.onPropChange('muted', !rule.value.muted, props.path, context);
  };

  const removeRule = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      schemaRef.value.actions.onRuleRemove(props.path);
    }
  };

  const shiftRuleUp = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value && !props.shiftUpDisabled) {
      schemaRef.value.actions.moveRule(props.path, 'up', event?.altKey, context);
    }
  };

  const shiftRuleDown = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value && !props.shiftDownDisabled) {
      schemaRef.value.actions.moveRule(props.path, 'down', event?.altKey, context);
    }
  };

  const fieldData = computed(() => {
    const schema = schemaRef.value;
    const resolvedFieldsList = schema.resolvedFieldsList;
    const fieldMap = (resolvedFieldsList as FullField[]).reduce((acc, field) => {
      const key = 'value' in field ? (field as FullField).value : 'name' in field ? (field as FullField).name : '';
      if (key) {
        acc[key] = field as FullField;
      }
      return acc;
    }, {} as Record<string, FullField>);

    return fieldMap[rule.value.field] ?? {
      name: rule.value.field,
      value: rule.value.field,
      label: rule.value.field,
    };
  });

  const inputType = computed(() => {
    const schema = schemaRef.value;
    const fd = fieldData.value;
    return fd.inputType ?? (schema.getInputType ? schema.getInputType(rule.value.field, rule.value.operator, { fieldData: fd }) : null);
  });

  const matchModes = computed(() => schemaRef.value.getMatchModeOptions(rule.value.field));

  const operators = computed(() =>
    schemaRef.value.getOperatorOptions(rule.value.field, { fieldData: fieldData.value }) as FullOptionList<FullOption>
  );

  const operatorObject = computed(() => getOption(operators.value, rule.value.operator));

  const arity = computed(() => operatorObject.value?.arity);
  const hideValueControls = computed(() => {
    const a = arity.value;
    return (typeof a === 'string' && a === 'unary') || (typeof a === 'number' && a < 2);
  });

  const valueSourceOptions = computed(() => {
    const schema = schemaRef.value;
    const configuredVSs = schema.getValueSourceOptions(rule.value.field, rule.value.operator);
    const vsList = Array.isArray(configuredVSs) ? configuredVSs : [];
    if (rule.value.valueSource && !getOption(vsList, rule.value.valueSource)) {
      return [
        ...vsList,
        {
          name: rule.value.valueSource,
          value: rule.value.valueSource,
          label: rule.value.valueSource,
        },
      ] as Array<FullOption & { value: ValueSource }>;
    }
    return vsList as Array<FullOption & { value: ValueSource }>;
  });

  const valueSources = computed(() =>
    valueSourceOptions.value.map((opt: FullOption & { value: ValueSource }) => opt.value) as ValueSources
  );

  const valueEditorType = computed(() => {
    const schema = schemaRef.value;
    if (rule.value.valueSource === 'field') {
      return 'select' as ValueEditorType;
    }
    return schema.getValueEditorType
      ? schema.getValueEditorType(rule.value.field, rule.value.operator, { fieldData: fieldData.value })
      : ('text' as ValueEditorType);
  });

  const valueEditorSeparator = computed(() => {
    const schema = schemaRef.value;
    const sep = schema.getValueEditorSeparator;
    return sep
      ? sep(rule.value.field, rule.value.operator, { fieldData: fieldData.value })
      : null;
  });

  const values = computed(() => {
    const schema = schemaRef.value;
    const v =
      rule.value.valueSource === 'field'
        ? filterFieldsByComparator(fieldData.value, schema.resolvedFieldsList, rule.value.operator)
        : schema.getValues
          ? schema.getValues(rule.value.field, rule.value.operator, { fieldData: fieldData.value })
          : [];
    return isFlexibleOptionArray(v) || isFlexibleOptionGroupArray(v) ? toFullOptionList(v) : v;
  });

  const subQueryBuilderProps = computed(() => {
    const schema = schemaRef.value;
    const getSubQueryBuilderProps = schema.getSubQueryBuilderProps;
    return getSubQueryBuilderProps
      ? (getSubQueryBuilderProps(rule.value.field, { fieldData: fieldData.value }) as Record<string, unknown>)
      : {};
  });

  const defaultSubproperties: FullOptionList<FullField> = [];
  const subproperties = computed(() => {
    const schema = schemaRef.value;
    const subFields =
      fieldData.value.subproperties ?? (subQueryBuilderProps.value.fields as FullOptionList<FullField>) ?? defaultSubproperties;
    return useFields({
      translations: schema.translations,
      fields: subFields as FullOptionList<FullField>,
      autoSelectField: schema.autoSelectField || !!fieldData.value.subproperties,
    });
  });

  const validationResult = computed(() => {
    const schema = schemaRef.value;
    const mapResult = schema.validationMap?.[props.id ?? ''];
    if (mapResult !== undefined) {
      return mapResult;
    }
    if (typeof fieldData.value.validator === 'function') {
      return fieldData.value.validator(rule.value);
    }
    return undefined;
  });

  const validationClassName = computed(() =>
    getValidationClassNames(validationResult.value ?? true)
  );

  const fieldBasedClassName = computed(() => fieldData.value?.className ?? '');
  const operatorBasedClassName = computed(() => operatorObject.value?.className ?? '');
  const hasSubQuery = computed(() => matchModes.value.length > 0);

  const outerClassName = computed(() => {
    const schema = schemaRef.value;
    const { classnames: classNamesProp, suppressStandardClassnames: sup, getRuleClassname: getRuleClass } = schema;
    const isDragging = props.isDragging ?? false;
    const isOver = props.isOver ?? false;
    const dropEffect = props.dropEffect ?? 'move';
    const groupItems = props.groupItems ?? false;
    const dropNotAllowed = props.dropNotAllowed ?? false;
    return clsx(
      getRuleClass?.(rule.value, { fieldData: fieldData.value }) ?? '',
      fieldBasedClassName.value,
      operatorBasedClassName.value,
      sup || standardClassnames.rule,
      classNamesProp.rule,
      disabled.value && classNamesProp.disabled,
      muted.value && classNamesProp.muted,
      isDragging && classNamesProp.dndDragging,
      isOver && classNamesProp.dndOver,
      isOver && dropEffect === 'copy' && classNamesProp.dndCopy,
      isOver && groupItems && classNamesProp.dndGroup,
      dropNotAllowed && classNamesProp.dndDropNotAllowed,
      hasSubQuery.value && classNamesProp.hasSubQuery,
      sup || {
        [standardClassnames.disabled]: disabled.value,
        [standardClassnames.muted]: muted.value,
        [standardClassnames.dndDragging]: isDragging,
        [standardClassnames.dndOver]: isOver,
        [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
        [standardClassnames.dndGroup]: isOver && groupItems,
        [standardClassnames.dndDropNotAllowed]: dropNotAllowed,
        [standardClassnames.hasSubQuery]: hasSubQuery.value,
      },
      validationClassName.value
    );
  });

  return {
    classNames,
    cloneRule,
    disabled,
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
}
