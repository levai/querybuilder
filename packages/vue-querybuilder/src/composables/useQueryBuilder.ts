import {
  addInPlace,
  updateInPlace,
  removeInPlace,
  moveInPlace,
  defaultControlClassnames,
  defaultCombinators,
  defaultOperators,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  defaultPlaceholderValueName,
  defaultTranslations,
  filterFieldsByComparator,
  findPath,
  generateAccessibleDescription,
  generateID,
  getFirstOption,
  getOption,
  getPathOfID,
  getValueSourcesUtil,
  getMatchModesUtil,
  group,
  isRuleGroup,
  isRuleGroupTypeIC,
  joinWith,
  mergeAnyTranslations,
  pathIsDisabled,
  pathsAreEqual,
  preferFlagProps,
  prepareOptionList,
  prepareRuleGroup,
  standardClassnames,
  toFlatOptionArray,
  toFullOptionList,
  toFullOption,
  convertToIC,
  convertFromIC,
  LogType,
} from '@react-querybuilder/core';
import { useDeprecatedProps } from './useDeprecatedProps';
import { useControlledOrUncontrolled } from './useControlledOrUncontrolled';
import { getEffectiveMaxLevels } from '../utils/maxLevelsUtils';
import { isPlaceholderValue } from '../utils/valueUtils';
import type { QueryBuilderFlags } from '@react-querybuilder/core';
import type {
  FullOption,
  InputType,
  Path,
  RuleGroupTypeAny,
  RuleType,
  ValueEditorType,
  ValueSource,
  MatchModeOptions,
  MatchMode,
} from '@react-querybuilder/core';
import { computed, reactive, shallowReactive, toRaw, toRef, unref, watch, onMounted, ref } from 'vue';
import type { QueryBuilderContextValue, QueryBuilderProps, Controls, ResolvedControls, QueryBuilderClassnames, FullField } from '../types';
import type { QueryActions } from '@react-querybuilder/core';
import type { Emitter } from '../types';
import ValueSelector from '../components/ValueSelector.vue';
import CombinatorSelector from '../components/CombinatorSelector.vue';
import ValueEditor from '../components/ValueEditor.vue';
import NotToggle from '../components/NotToggle.vue';
import ActionElement from '../components/ActionElement.vue';
import DragHandle from '../components/DragHandle.vue';
import ShiftActions from '../components/ShiftActions.vue';
import InlineCombinator from '../components/InlineCombinator.vue';

/** 将 FullOptionList 转换为展平后的 FullOption[]，使用核心包的 toFlatOptionArray 处理分组数组 */
function toOptions(list: unknown): Array<FullOption> {
  if (!Array.isArray(list)) return [];
  return toFlatOptionArray(list as Parameters<typeof toFlatOptionArray>[0]);
}

/** 从选项列表取首项；between/notBetween 返回 [v,v] 或 join 字符串 */
function getFirstOptionsFrom(
  opts: FullOption[],
  operator: string,
  listsAsArrays?: boolean
): string | (string | null)[] {
  const firstOption = getFirstOption(opts) ?? '';
  if (operator === 'between' || operator === 'notBetween') {
    const valueAsArray = [firstOption, firstOption];
    return listsAsArrays ? (valueAsArray as (string | null)[]) : joinWith(valueAsArray.map((v) => v ?? ''), ',');
  }
  return firstOption;
}

/** 默认控件组件，不依赖 props，可提到模块顶以缩短 composable 体量 */
const DEFAULT_CONTROLS: Controls = {
  fieldSelector: ValueSelector,
  operatorSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
  matchModeEditor: undefined,
  valueEditor: ValueEditor,
  combinatorSelector: CombinatorSelector,
  notToggle: NotToggle,
  actionElement: ActionElement,
  dragHandle: DragHandle,
};

export function useQueryBuilder(props: QueryBuilderProps, emit?: Emitter) {
  // --- Query state & identity ---
  /** 获取字段数据，封装重复的 getOption 调用 */
  const getField = (fieldName: string) => {
    if (!props.fields?.length) return undefined;
    return getOption(props.fields as Parameters<typeof getOption>[0], fieldName);
  };
  const getId = (): string => (props.idGenerator ?? generateID)();
  const qbId = (() => getId())();

  const initialQuery = (): RuleGroupTypeAny => {
    const raw =
      props.modelValue ??
      props.defaultQuery ??
      prepareRuleGroup({ combinator: 'and', rules: [] }, { idGenerator: getId });
    return toRaw(raw) as RuleGroupTypeAny;
  };

  // 对于非受控模式，使用 reactive 包装 query，以便 Vue 追踪变化
  // 对于受控模式，query 是 computed，从 props.modelValue 读取
  const isControlled = computed(() => props.modelValue != null);
  
  // 非受控模式：使用 reactive 包装，可以直接使用 mutable API 修改
  const internalQuery = reactive<RuleGroupTypeAny>(initialQuery());
  
  // 受控模式：从 props.modelValue 读取（unref 保证父组件传 ref 时也能正确追踪 .value 变化）
  const query = computed<RuleGroupTypeAny>(() =>
    isControlled.value
      ? (toRaw(unref(props.modelValue)!) as RuleGroupTypeAny)
      : internalQuery
  );

  // 独立组合符模式：优先使用 prop，如果没有 prop 则根据 query 类型自动检测
  const independentCombinators = computed(() => {
    if (props.independentCombinators !== undefined) {
      return props.independentCombinators;
    }
    return isRuleGroupTypeIC(query.value);
  });

  // 监听 independentCombinators prop 变化，自动转换 query 格式
  watch(
    () => props.independentCombinators,
    (useIC) => {
      if (useIC === undefined) return;
      const currentIsIC = isRuleGroupTypeIC(query.value);
      if (useIC && !currentIsIC) {
        const converted = convertToIC(query.value);
        updateQuery(converted);
      } else if (!useIC && currentIsIC) {
        const converted = convertFromIC(query.value);
        updateQuery(converted);
      }
    }
  );

  // 废弃 prop 警告：independentCombinators 应由 query 类型推断，传 prop 即废弃
  const independentCombinatorsFromQuery = computed(() => isRuleGroupTypeIC(query.value));
  watch(
    [() => props.independentCombinators, independentCombinatorsFromQuery],
    ([propIC, fromQuery]) => {
      const invalidIC = !!propIC && !fromQuery;
      const logWarning =
        invalidIC || (!invalidIC && (props.independentCombinators ?? 'not present') !== 'not present');
      useDeprecatedProps(
        'independentCombinators',
        !!logWarning,
        invalidIC ? 'invalid' : 'unnecessary'
      );
    },
    { immediate: true }
  );

  // 更新 query 的辅助函数
  // 对于受控模式，需要创建副本并 emit
  // 对于非受控模式，直接修改 reactive 对象即可
  function updateQuery(q: RuleGroupTypeAny) {
    if (!isRuleGroup(q)) return;
    if (!isControlled.value) {
      // 非受控模式：直接修改 reactive 对象
      Object.assign(internalQuery, q);
      // 触发 emit 和回调
      emit?.('update:modelValue', toRaw(internalQuery));
      props.onUpdateModelValue?.(toRaw(internalQuery));
    } else {
      // 受控模式：emit 新值，由父组件更新 props.modelValue
      emit?.('update:modelValue', q);
      props.onUpdateModelValue?.(q);
    }
  }

  // 获取可修改的 query 对象（用于 mutable API）
  // 对于受控模式，创建副本；对于非受控模式，直接返回 reactive 对象
  function getMutableQuery(): RuleGroupTypeAny {
    if (isControlled.value) {
      // 受控模式：创建深拷贝，以便使用 mutable API
      return JSON.parse(JSON.stringify(query.value)) as RuleGroupTypeAny;
    } else {
      // 非受控模式：直接返回 reactive 对象
      return internalQuery;
    }
  }

  const disabledPaths = computed((): Path[] =>
    Array.isArray(props.disabled) ? props.disabled : []
  );
  const queryDisabled = computed(
    () =>
      props.disabled === true ||
      (Array.isArray(props.disabled) && props.disabled.some((p) => p.length === 0))
  );
  const isPathDisabled = (path: Path) =>
    pathIsDisabled(path, query.value) ||
    disabledPaths.value.some((p) => pathsAreEqual(p, path));

  // --- Debug & Logging ---
  const defaultOnLog = (...params: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(...params);
  };

  const log = (...params: unknown[]) => {
    if (flags.value.debugMode) {
      (props.onLog ?? defaultOnLog)(...params);
    }
  };

  useControlledOrUncontrolled({
    modelValue: toRef(props, 'modelValue'),
    defaultQuery: toRef(props, 'defaultQuery'),
  });

  // --- enableMountQueryChange ---
  const hasRunMountQueryChange = ref(false);
  onMounted(() => {
    if (hasRunMountQueryChange.value) return;
    hasRunMountQueryChange.value = true;
    if (flags.value.enableMountQueryChange && typeof props.onUpdateModelValue === 'function') {
      const rootGroup = query.value.id
        ? query.value
        : prepareRuleGroup(query.value, { idGenerator: getId });
      props.onUpdateModelValue(rootGroup);
      emit?.('update:modelValue', rootGroup);
    }
  });

  // --- Flags & option lists ---
  const flags = computed<QueryBuilderFlags>(() =>
    preferFlagProps(
      {
        autoSelectField: props.autoSelectField,
        autoSelectOperator: props.autoSelectOperator,
        autoSelectValue: props.autoSelectValue,
        resetOnFieldChange: props.resetOnFieldChange,
        resetOnOperatorChange: props.resetOnOperatorChange,
        addRuleToNewGroups: props.addRuleToNewGroups,
        enableDragAndDrop: props.enableDragAndDrop,
        debugMode: props.debugMode,
        enableMountQueryChange: props.enableMountQueryChange,
        listsAsArrays: props.listsAsArrays,
        suppressStandardClassnames: props.suppressStandardClassnames,
      },
      {},
      true
    )
  );

  const translations = computed(() => {
    if (props.translations) {
      return mergeAnyTranslations(defaultTranslations, props.translations) as typeof defaultTranslations;
    }
    return defaultTranslations;
  });

  const preparedFieldsResult = computed(() =>
    prepareOptionList({
      optionList: props.fields ?? [],
      placeholder: translations.value.fields,
      autoSelectOption: flags.value.autoSelectField!,
      baseOption: props.baseField,
    })
  );

  const fields = computed(() => toOptions(preparedFieldsResult.value.optionList));

  const operators = computed(() => {
    const t = translations.value;
    const prepared = prepareOptionList({
      optionList: (props.operators ?? defaultOperators) as unknown as Array<{ name: string; value: string; label: string }>,
      placeholder: t.operators,
      autoSelectOption: flags.value.autoSelectOperator!,
      baseOption: props.baseOperator,
    });
    return toOptions(prepared.optionList);
  });

  const combinators = computed(() => {
    const fullOptions = toFullOptionList(
      (props.combinators ?? defaultCombinators) as unknown[],
      props.baseCombinator
    );
    return toOptions(fullOptions);
  });

  // --- Field/operator/value getters (per-field) ---
  const getOperatorOptionsList = (fieldName: string): Array<FullOption> => {
    const fieldData = getField(fieldName) as FullField | undefined;
    if (props.getOperators) {
      const custom = props.getOperators(fieldName, { fieldData: (fieldData ?? {}) as FullField });
      if (custom === null) {
        // 返回 null 时使用默认逻辑
      } else if (Array.isArray(custom) && custom.length >= 0) {
        const fullOperatorOptions = toFullOptionList(custom as unknown[], props.baseOperator);
        return toOptions(fullOperatorOptions);
      }
    }
    const operatorsList =
      (fieldData != null && typeof fieldData === 'object' && 'operators' in fieldData
        ? (fieldData as { operators?: unknown }).operators
        : undefined) ?? props.operators ?? defaultOperators;
    const fullOperatorOptions = toFullOptionList(operatorsList as unknown[], props.baseOperator);
    return toOptions(fullOperatorOptions);
  };

  const getOperatorOptions = (field: string) => getOperatorOptionsList(field);

  // --- createRule / createRuleGroup ---
  const createRule = (): RuleType => {
    const autoSelectField = flags.value.autoSelectField!;
    const autoSelectOperator = flags.value.autoSelectOperator!;

    const fullFieldOptions = preparedFieldsResult.value.optionList;
    const fieldOptions = toOptions(fullFieldOptions);

    const field =
      props.getDefaultField !== undefined
        ? typeof props.getDefaultField === 'function'
          ? props.getDefaultField(fullFieldOptions as FullField[])
          : props.getDefaultField
        : autoSelectField && fieldOptions.length > 0
          ? ((getFirstOption(fieldOptions) as string | null) ?? defaultPlaceholderFieldName)
          : defaultPlaceholderFieldName;

    const fieldData = getField(field);
    const operatorOptions = getOperatorOptionsList(field);

    const operator =
      props.getDefaultOperator !== undefined
        ? typeof props.getDefaultOperator === 'function'
          ? props.getDefaultOperator(field, { fieldData: (fieldData ?? {}) as FullField })
          : props.getDefaultOperator
        : autoSelectOperator && operatorOptions.length > 0
          ? ((getFirstOption(operatorOptions) as string | null) ?? defaultPlaceholderOperatorName)
          : defaultPlaceholderOperatorName;

    const valueSourceOptions = getValueSourceOptions(field, operator);
    const defaultValueSource = valueSourceOptions.length > 0 ? (valueSourceOptions[0].value as ValueSource) : undefined;

    const matchModeOptions = getMatchModeOptions(field);
    const defaultMatchMode = matchModeOptions.length > 0 ? (getFirstOption(matchModeOptions) as MatchMode | null) : null;
    const hasMatchMode = !!defaultMatchMode;

    const ruleId = getId();
    
    let value: string | number | boolean | (string | null)[] | RuleGroupTypeAny;
    if (hasMatchMode) {
      value = prepareRuleGroup({ combinator: 'and', rules: [] }, { idGenerator: getId });
    } else {
      const tempRule: RuleType = {
        id: ruleId,
        field,
        operator,
        value: '',
        ...(defaultValueSource ? { valueSource: defaultValueSource } : {}),
      };
      value = props.getDefaultValue !== undefined
        ? props.getDefaultValue(tempRule, { fieldData: (fieldData ?? {}) as FullField })
        : getRuleDefaultValue(tempRule);
    }

    return {
      id: ruleId,
      field,
      operator,
      value,
      ...(defaultValueSource ? { valueSource: defaultValueSource } : {}),
      ...(hasMatchMode ? { match: { mode: defaultMatchMode!, threshold: 1 } } : {}),
    };
  };

  const createRuleGroup = (): RuleGroupTypeAny => {
    const initialRules: (RuleGroupTypeAny | RuleType)[] = [];
    if (flags.value.addRuleToNewGroups) {
      initialRules.push(createRule());
    }
    if (independentCombinators.value) {
      return prepareRuleGroup(
        { rules: initialRules } as RuleGroupTypeAny,
        { idGenerator: getId }
      );
    }
    return prepareRuleGroup(
      { combinator: 'and', rules: initialRules } as RuleGroupTypeAny,
      { idGenerator: getId }
    );
  };

  // --- Actions (使用 mutable API) ---
  const removeAtPath = (path: number[]) => {
    if (isPathDisabled(path) || queryDisabled.value) {
      log({ qbId, type: LogType.pathDisabled, path, query: query.value });
      return;
    }
    const ruleOrGroup = findPath(path, query.value);
    if (ruleOrGroup !== null && props.onRemove?.(ruleOrGroup, path, query.value) === false) {
      log({ qbId, type: LogType.onRemoveFalse, ruleOrGroup, path, query: query.value });
      return;
    }
    
    const mutableQuery = getMutableQuery();
    removeInPlace(mutableQuery, path);
    log({ qbId, type: LogType.remove, query: query.value, newQuery: mutableQuery, path, ruleOrGroup });
    updateQuery(mutableQuery);
  };

  const actions: QueryActions = {
    onRuleAdd(rule, parentPath, _context) {
      if (isPathDisabled(parentPath) || queryDisabled.value) {
        log({ qbId, type: LogType.parentPathDisabled, rule, parentPath, query: query.value });
        return;
      }
      const cb = props.onAddRule?.(rule, parentPath, query.value);
      if (cb === false) {
        log({ qbId, type: LogType.onAddRuleFalse, rule, parentPath, query: query.value });
        return;
      }
      const ruleToAdd = typeof cb === 'object' && cb !== null && 'field' in cb ? cb : rule;
      
      const mutableQuery = getMutableQuery();
      addInPlace(mutableQuery, ruleToAdd, parentPath, { idGenerator: getId });
      log({ qbId, type: LogType.add, query: query.value, newQuery: mutableQuery, newRule: ruleToAdd, parentPath });
      updateQuery(mutableQuery);
    },
    onGroupAdd(ruleGroup, parentPath, _context) {
      if (parentPath.length >= getEffectiveMaxLevels(props.maxLevels)) return;
      if (isPathDisabled(parentPath) || queryDisabled.value) {
        log({
          qbId,
          type: LogType.parentPathDisabled,
          ruleGroup,
          parentPath,
          query: query.value,
        });
        return;
      }
      const cb = props.onAddGroup?.(ruleGroup, parentPath, query.value);
      if (cb === false) {
        log({ qbId, type: LogType.onAddGroupFalse, ruleGroup, parentPath, query: query.value });
        return;
      }
      const groupToAdd =
        typeof cb === 'object' && cb !== null && 'rules' in cb ? cb : ruleGroup;
      
      const mutableQuery = getMutableQuery();
      addInPlace(mutableQuery, groupToAdd, parentPath, { idGenerator: getId });
      log({ qbId, type: LogType.add, query: query.value, newQuery: mutableQuery, newGroup: groupToAdd, parentPath });
      updateQuery(mutableQuery);
    },
    onRuleRemove(path) {
      removeAtPath(path);
    },
    onGroupRemove(path) {
      removeAtPath(path);
    },
    onPropChange(prop, value, path, _context) {
      if ((isPathDisabled(path) && prop !== 'disabled') || queryDisabled.value) {
        log({ qbId, type: LogType.pathDisabled, path, prop, value, query: query.value });
        return;
      }

      const normalizedValue = (prop === 'value' && isPlaceholderValue(value)) ? '' : value;

      const getMatchModesForUpdate = (field: string): MatchModeOptions => {
        const fieldData = getField(field);
        const fullFieldData = fieldData ? toFullOption(fieldData) : toFullOption({ name: field, label: field, value: field } as FullField);
        if (props.getMatchModes) {
          const result = props.getMatchModes(field, { fieldData: fullFieldData as any });
          if (result === true) return getMatchModesUtil(fullFieldData, undefined);
          if (result === false) return [];
          if (Array.isArray(result)) return toFullOptionList(result as unknown[]) as MatchModeOptions;
          return [];
        }
        return getMatchModesUtil(fullFieldData, undefined);
      };

      const updateOptions = {
        resetOnFieldChange: flags.value.resetOnFieldChange!,
        resetOnOperatorChange: flags.value.resetOnOperatorChange!,
        getRuleDefaultOperator,
        getRuleDefaultValue,
        getValueSources: props.getValueSources
          ? (field: string, operator: string) =>
              props.getValueSources!(field, operator, { fieldData: getField(field) ?? ({} as FullField) } as any)
          : undefined,
        getMatchModes: getMatchModesForUpdate,
      } as import('@react-querybuilder/core').UpdateOptions;

      const mutableQuery = getMutableQuery();
      updateInPlace(mutableQuery, prop, normalizedValue, path, updateOptions);
      log({ qbId, type: LogType.update, query: query.value, newQuery: mutableQuery, prop, value, path });
      updateQuery(mutableQuery);
    },
    moveRule(oldPath, newPath, clone, _context) {
      if (isPathDisabled(oldPath) || queryDisabled.value) {
        log({ qbId, type: LogType.pathDisabled, oldPath, newPath, query: query.value });
        return;
      }
      const ruleOrGroup = findPath(oldPath, query.value);
      const moveOptions = {
        clone,
        combinators: props.combinators ?? defaultCombinators,
        idGenerator: getId,
      } as any;
      
      const mutableQuery = getMutableQuery();
      moveInPlace(mutableQuery, oldPath, newPath, moveOptions);
      const resolvedToPath =
        Array.isArray(newPath)
          ? newPath
          : ruleOrGroup && 'id' in ruleOrGroup && typeof ruleOrGroup.id === 'string'
            ? getPathOfID(ruleOrGroup.id, mutableQuery)
            : null;
      const toPath = resolvedToPath ?? newPath;
      
      if (ruleOrGroup && !isRuleGroup(ruleOrGroup)) {
        const cb = props.onMoveRule?.(
          ruleOrGroup,
          oldPath,
          toPath,
          query.value,
          mutableQuery,
          moveOptions,
          undefined
        );
        if (cb === false) {
          log({
            qbId,
            type: LogType.onMoveRuleFalse,
            ruleOrGroup,
            oldPath,
            newPath,
            clone,
            query: query.value,
            nextQuery: mutableQuery,
          });
          // 取消操作，恢复原 query
          updateQuery(query.value);
          return;
        }
        const newQuery = typeof cb === 'object' && cb !== null && 'rules' in cb ? cb : mutableQuery;
        log({ qbId, type: LogType.move, query: query.value, newQuery, oldPath, newPath, clone });
        updateQuery(newQuery);
        return;
      }
      if (ruleOrGroup && isRuleGroup(ruleOrGroup)) {
        const cb = props.onMoveGroup?.(
          ruleOrGroup,
          oldPath,
          toPath,
          query.value,
          mutableQuery,
          moveOptions,
          undefined
        );
        if (cb === false) {
          log({
            qbId,
            type: LogType.onMoveGroupFalse,
            ruleOrGroup,
            oldPath,
            newPath,
            clone,
            query: query.value,
            nextQuery: mutableQuery,
          });
          updateQuery(query.value);
          return;
        }
        const newQuery = typeof cb === 'object' && cb !== null && 'rules' in cb ? cb : mutableQuery;
        log({ qbId, type: LogType.move, query: query.value, newQuery, oldPath, newPath, clone });
        updateQuery(newQuery);
        return;
      }
      log({ qbId, type: LogType.move, query: query.value, newQuery: mutableQuery, oldPath, newPath, clone });
      updateQuery(mutableQuery);
    },
    groupRule(sourcePath, targetPath, clone, _context) {
      if (isPathDisabled(sourcePath) || queryDisabled.value) {
        log({ qbId, type: LogType.pathDisabled, sourcePath, targetPath, query: query.value });
        return;
      }
      const ruleOrGroup = findPath(sourcePath, query.value);
      // group 函数返回新 query，但我们可以使用 mutable API 的等价操作
      // 由于 core 包没有 groupInPlace，我们需要先使用 group 创建新 query，然后替换
      const groupOptions = {
        clone,
        combinators: props.combinators ?? defaultCombinators,
        idGenerator: getId,
      } as any;
      const nextQuery = group(query.value, sourcePath, targetPath, groupOptions);
      if (ruleOrGroup && !isRuleGroup(ruleOrGroup)) {
        if (props.onGroupRule) {
          const cb = props.onGroupRule(ruleOrGroup, sourcePath, targetPath, query.value, nextQuery, groupOptions, _context);
          if (cb === false) {
            log({
              qbId,
              type: LogType.onGroupRuleFalse,
              ruleOrGroup,
              sourcePath,
              targetPath,
              clone,
              query: query.value,
              nextQuery,
            });
            return;
          }
          const newQuery = typeof cb === 'object' && cb !== null && 'rules' in cb ? cb : nextQuery;
          log({
            qbId,
            type: LogType.group,
            query: query.value,
            newQuery,
            sourcePath,
            targetPath,
            clone,
          });
          updateQuery(newQuery);
        } else {
          log({
            qbId,
            type: LogType.group,
            query: query.value,
            newQuery: nextQuery,
            sourcePath,
            targetPath,
            clone,
          });
          updateQuery(nextQuery);
        }
        return;
      }
      if (ruleOrGroup && isRuleGroup(ruleOrGroup)) {
        if (props.onGroupGroup) {
          const cb = props.onGroupGroup(ruleOrGroup, sourcePath, targetPath, query.value, nextQuery, groupOptions, _context);
          if (cb === false) {
            log({
              qbId,
              type: LogType.onGroupGroupFalse,
              ruleOrGroup,
              sourcePath,
              targetPath,
              clone,
              query: query.value,
              nextQuery,
            });
            return;
          }
          const newQuery = typeof cb === 'object' && cb !== null && 'rules' in cb ? cb : nextQuery;
          log({
            qbId,
            type: LogType.group,
            query: query.value,
            newQuery,
            sourcePath,
            targetPath,
            clone,
          });
          updateQuery(newQuery);
        } else {
          log({
            qbId,
            type: LogType.group,
            query: query.value,
            newQuery: nextQuery,
            sourcePath,
            targetPath,
            clone,
          });
          updateQuery(nextQuery);
        }
        return;
      }
      log({
        qbId,
        type: LogType.group,
        query: query.value,
        newQuery: nextQuery,
        sourcePath,
        targetPath,
        clone,
      });
      updateQuery(nextQuery);
    },
  };

  // --- Validation ---
  const validationMap = computed(() => {
    const raw = props.validator?.(query.value);
    if (raw === undefined) return undefined;
    if (typeof raw === 'object' && raw !== null && !('valid' in raw))
      return raw as Record<string, boolean | { valid: boolean; reasons?: string[] }>;
    const single = typeof raw === 'boolean' ? raw : raw;
    const map: Record<string, boolean | { valid: boolean; reasons?: string[] }> = {};
    if (query.value && 'id' in query.value && typeof (query.value as { id?: string }).id === 'string')
      map[(query.value as { id: string }).id] = single as boolean | { valid: boolean };
    return map;
  });

  const getRuleDefaultOperator = (field: string): string => {
    const fieldData = getField(field) as FullField | undefined;
    if (fieldData?.defaultOperator) {
      return fieldData.defaultOperator;
    }
    if (props.getDefaultOperator !== undefined) {
      const op =
        typeof props.getDefaultOperator === 'function'
          ? props.getDefaultOperator(field, { fieldData: (fieldData ?? {}) as FullField })
          : props.getDefaultOperator;
      return op ?? defaultPlaceholderOperatorName;
    }
    const autoSelectOperator = flags.value.autoSelectOperator!;
    if (autoSelectOperator) {
      const operatorOptions = getOperatorOptionsList(field);
      return operatorOptions.length > 0
        ? ((getFirstOption(operatorOptions) as string | null) ?? defaultPlaceholderOperatorName)
        : defaultPlaceholderOperatorName;
    }
    return defaultPlaceholderOperatorName;
  };

  const getRuleDefaultValue = (rule: RuleType): string | number | boolean | (string | null)[] | RuleGroupTypeAny => {
    const fieldData = getField(rule.field) as FullField | undefined;
    if (!fieldData || rule.field === defaultPlaceholderFieldName || rule.operator === defaultPlaceholderOperatorName) {
      return '';
    }

    const matchModeOpts = getMatchModesUtil(toFullOption(fieldData), props.getMatchModes);
    if (matchModeOpts.length > 0) {
      return prepareRuleGroup({ combinator: 'and', rules: [] }, { idGenerator: getId });
    }

    if (fieldData.defaultValue !== undefined && fieldData.defaultValue !== null) {
      return fieldData.defaultValue;
    }

    let value: string | (string | null)[] | boolean | null = '';

    const valueOptions = getValues(rule.field, rule.operator);
    const ruleValueSource = (rule as { valueSource?: ValueSource }).valueSource;

    if (ruleValueSource === 'field') {
      const filteredFields = filterFieldsByComparator(fieldData, preparedFieldsResult.value.optionList, rule.operator);
      value = filteredFields.length > 0 ? getFirstOptionsFrom(filteredFields as FullOption[], rule.operator, flags.value.listsAsArrays) : '';
      return value;
    }

    if (props.getDefaultValue !== undefined) {
      return props.getDefaultValue(rule, { fieldData: (fieldData ?? {}) as FullField });
    }

    if (valueOptions.length > 0) {
      const valueEditorType = getValueEditorType(rule.field, rule.operator);
      if (valueEditorType === 'multiselect') {
        value = flags.value.listsAsArrays ? ([] as (string | null)[]) : '';
      } else if (valueEditorType === 'select' || valueEditorType === 'radio') {
        value = getFirstOptionsFrom(valueOptions, rule.operator, flags.value.listsAsArrays);
      }
    } else {
      const valueEditorType = getValueEditorType(rule.field, rule.operator);
      if (valueEditorType === 'checkbox') {
        value = false;
      }
    }

    return value;
  };

  const getValueEditorType = (fieldName: string, operator: string): ValueEditorType => {
    const field = getField(fieldName);
    if (!field) return 'text';
    const vet = (field as { valueEditorType?: ValueEditorType | ((op: string) => ValueEditorType) }).valueEditorType;
    if (typeof vet === 'function') return vet(operator) ?? 'text';
    return vet ?? 'text';
  };

  const getInputType = (fieldName: string): InputType | null => {
    const field = getField(fieldName);
    if (!field) return null;
    const it = (field as { inputType?: InputType | null }).inputType;
    return it ?? null;
  };

  const getValues = (fieldName: string, operator: string): Array<FullOption> => {
    const field = getField(fieldName);
    if (!field) return [];
    const vals = (field as { values?: unknown[] | ((op: string) => unknown) }).values;
    if (!vals) return [];
    const list = typeof vals === 'function' ? vals(operator) : vals;
    const t = translations.value;
    const prepared = prepareOptionList({
      optionList: (Array.isArray(list) ? list : []) as unknown as Array<{ name: string; value: string; label: string }>,
      placeholder: t.values,
      autoSelectOption: flags.value.autoSelectValue!,
    });
    const options = toOptions(prepared.optionList);
    return options.filter((opt) => opt.value !== defaultPlaceholderValueName);
  };

  const getValuePlaceholder = (fieldName: string, operator: string): string | undefined => {
    if (fieldName === defaultPlaceholderFieldName || operator === defaultPlaceholderOperatorName) {
      return undefined;
    }
    const field = getField(fieldName);
    return field ? (field as { placeholder?: string }).placeholder : undefined;
  };

  const getFieldData = (fieldName: string) => getField(fieldName) as FullField | undefined;

  const getValueSourceOptions = (fieldName: string, operator: string): Array<FullOption> => {
    const fieldData = getField(fieldName) as FullField | undefined;
    const fallbackField = { name: fieldName, value: fieldName, label: fieldName } as FullField;
    const fullOptions = getValueSourcesUtil<FullField, string>(
      fieldData ?? fallbackField,
      operator,
      props.getValueSources
    );
    return fullOptions;
  };

  const getMatchModeOptions = (fieldName: string) => {
    const fieldData = getField(fieldName) as FullField | undefined;
    return getMatchModesUtil(
      fieldData ?? ({ name: fieldName, value: fieldName, label: fieldName } as FullField),
      props.getMatchModes
    );
  };

  // --- Controls & context ---
  const controlsProp = toRef(props, 'controls');
  const controls = computed((): ResolvedControls => {
    const base: Controls = {
      ...DEFAULT_CONTROLS,
      ...(controlsProp.value || {}),
    };
    const ae = base.actionElement;
    return {
      ...base,
      addRuleAction: base.addRuleAction ?? ae,
      addGroupAction: base.addGroupAction ?? ae,
      cloneRuleAction: base.cloneRuleAction ?? ae,
      cloneGroupAction: base.cloneGroupAction ?? ae,
      removeRuleAction: base.removeRuleAction ?? ae,
      removeGroupAction: base.removeGroupAction ?? ae,
      lockRuleAction: base.lockRuleAction ?? ae,
      lockGroupAction: base.lockGroupAction ?? ae,
      muteRuleAction: base.muteRuleAction ?? ae,
      muteGroupAction: base.muteGroupAction ?? ae,
      shiftActions: base.shiftActions ?? ShiftActions,
      inlineCombinator: base.inlineCombinator ?? InlineCombinator,
    };
  });

  const contextValue = computed((): QueryBuilderContextValue => ({
    fields: fields.value as QueryBuilderContextValue['fields'],
    resolvedFieldsList: preparedFieldsResult.value.optionList as QueryBuilderContextValue['resolvedFieldsList'],
    operators: operators.value as QueryBuilderContextValue['operators'],
    combinators: combinators.value as QueryBuilderContextValue['combinators'],
    translations: translations.value as Record<string, { label?: string; title?: string }>,
    actions,
    createRule,
    createRuleGroup,
    showNotToggle: props.showNotToggle ?? false,
    showShiftActions: props.showShiftActions ?? false,
    showCloneButtons: props.showCloneButtons ?? false,
    showLockButtons: props.showLockButtons ?? false,
    showMuteButtons: props.showMuteButtons ?? false,
    showCombinatorsBetweenRules: props.showCombinatorsBetweenRules ?? false,
    showBranches: props.showBranches ?? false,
    independentCombinators: independentCombinators.value,
    disabled: queryDisabled.value,
    disabledPaths: disabledPaths.value,
    autoSelectField: flags.value.autoSelectField!,
    autoSelectOperator: flags.value.autoSelectOperator!,
    autoSelectValue: flags.value.autoSelectValue!,
    resetOnFieldChange: flags.value.resetOnFieldChange!,
    resetOnOperatorChange: flags.value.resetOnOperatorChange!,
    addRuleToNewGroups: flags.value.addRuleToNewGroups!,
    enableDragAndDrop: flags.value.enableDragAndDrop!,
    debugMode: flags.value.debugMode!,
    enableMountQueryChange: flags.value.enableMountQueryChange!,
    listsAsArrays: flags.value.listsAsArrays!,
    suppressStandardClassnames: flags.value.suppressStandardClassnames!,
    validator: props.validator as QueryBuilderContextValue['validator'],
    validationMap: validationMap.value,
    query: query.value,
    getOperatorOptions,
    getValueEditorType,
    getInputType,
    getValues,
    getValuePlaceholder,
    getFieldData,
    getRuleClassname: props.getRuleClassname,
    getRuleGroupClassname: props.getRuleGroupClassname,
    maxLevels: getEffectiveMaxLevels(props.maxLevels),
    qbId,
    accessibleDescriptionGenerator: props.accessibleDescriptionGenerator ?? generateAccessibleDescription,
    parseNumbers: props.parseNumbers,
    getValueEditorSeparator: props.getValueEditorSeparator,
    getValueSources: props.getValueSources as any,
    getValueSourceOptions,
    getMatchModeOptions: getMatchModeOptions as any,
    getSubQueryBuilderProps: props.getSubQueryBuilderProps as any,
    context: props.context,
    controls: controls.value as QueryBuilderContextValue['controls'],
    classnames: {
      ...(flags.value.suppressStandardClassnames!
        ? defaultControlClassnames
        : { ...defaultControlClassnames, ...standardClassnames }),
      ...(props.classnames || {}),
    } as QueryBuilderClassnames,
  } as QueryBuilderContextValue));

  return {
    query,
    contextValue,
    actions,
  };
}
