import {
  clsx,
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  isRuleGroup,
  isRuleGroupTypeIC,
  standardClassnames,
} from '@react-querybuilder/core';
import type {
  Path,
  RuleGroupTypeAny,
  ValidationResult,
} from '@react-querybuilder/core';
import { computed, type ComputedRef, type Ref, unref } from 'vue';
import type { QueryBuilderContextValue } from '../types';
import { usePathsMemo, type PathInfo } from './usePathsMemo';

export type { PathInfo };

/** schema 支持 Ref 以便 inject 的 context 变化时保持响应式 */
export interface UseRuleGroupProps {
  id?: string;
  path: Path;
  ruleGroup: RuleGroupTypeAny;
  schema: Ref<QueryBuilderContextValue> | QueryBuilderContextValue;
  disabled?: boolean;
  parentDisabled?: boolean;
  parentMuted?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  combinator?: string;
  rules?: unknown[];
  not?: boolean;
  dropEffect?: 'move' | 'copy';
  groupItems?: boolean;
  dragMonitorId?: string;
  dropMonitorId?: string;
  previewRef?: unknown;
  dragRef?: unknown;
  dropRef?: unknown;
  isDragging?: boolean;
  isOver?: boolean;
  dropNotAllowed?: boolean;
  context?: unknown;
}

export interface UseRuleGroup {
  addGroup: (event?: MouseEvent, context?: unknown) => void;
  addRule: (event?: MouseEvent, context?: unknown) => void;
  accessibleDescription: ComputedRef<string>;
  muted: ComputedRef<boolean>;
  classNames: ComputedRef<{
    header: string;
    shiftActions: string;
    dragHandle: string;
    combinators: string;
    notToggle: string;
    addRule: string;
    addGroup: string;
    cloneGroup: string;
    lockGroup: string;
    muteGroup: string;
    removeGroup: string;
    body: string;
  }>;
  cloneGroup: (event?: MouseEvent, context?: unknown) => void;
  onCombinatorChange: (value: string) => void;
  onGroupAdd: (group: RuleGroupTypeAny, parentPath: Path, context?: unknown) => void;
  onIndependentCombinatorChange: (value: string, index: number, context?: unknown) => void;
  onNotToggleChange: (checked: boolean, context?: unknown) => void;
  outerClassName: ComputedRef<string>;
  pathsMemo: ComputedRef<PathInfo[]>;
  removeGroup: (event?: MouseEvent, context?: unknown) => void;
  ruleGroup: ComputedRef<RuleGroupTypeAny>;
  shiftGroupDown: (event?: MouseEvent, context?: unknown) => void;
  shiftGroupUp: (event?: MouseEvent, context?: unknown) => void;
  toggleLockGroup: (event?: MouseEvent, context?: unknown) => void;
  toggleMuteGroup: (event?: MouseEvent, context?: unknown) => void;
  validationClassName: ComputedRef<string>;
  validationResult: ComputedRef<boolean | ValidationResult | undefined>;
  combinator: ComputedRef<string>;
  disabled: ComputedRef<boolean>;
}

/**
 * Prepares all values and methods used by the RuleGroup component.
 * schema 支持 Ref，保证 inject 的 context 更新时界面联动。
 */
export function useRuleGroup(props: UseRuleGroupProps): UseRuleGroup {
  const schemaRef = computed(() => unref(props.schema));

  const disabled = computed(() => !!props.parentDisabled || !!props.disabled);
  const muted = computed(() => !!props.parentMuted || !!unref(props.ruleGroup)?.muted);

  const combinator = computed(() => {
    const ruleGroupProp = unref(props.ruleGroup);
    const schema = schemaRef.value;
    const combinators = schema.combinators;
    const firstOpt = getFirstOption(combinators);
    const firstVal = firstOpt == null ? '' : typeof firstOpt === 'string' ? firstOpt : (firstOpt as { value?: string; name?: string }).value ?? (firstOpt as { value?: string; name?: string }).name ?? '';
    if (ruleGroupProp && !isRuleGroupTypeIC(ruleGroupProp)) {
      return ruleGroupProp.combinator;
    }
    if (ruleGroupProp) {
      return firstVal;
    }
    return props.combinator ?? firstVal;
  });

  const ruleGroup = computed((): RuleGroupTypeAny => {
    const ruleGroupProp = unref(props.ruleGroup);
    const schema = schemaRef.value;
    const independentCombinators = schema.independentCombinators;
    if (ruleGroupProp) {
      if (ruleGroupProp.combinator === combinator.value || independentCombinators) {
        return ruleGroupProp;
      }
      const newRG = structuredClone(ruleGroupProp);
      if (!isRuleGroupTypeIC(newRG)) {
        newRG.combinator = combinator.value;
      }
      return newRG;
    }
    return { rules: props.rules ?? [], not: props.not } as RuleGroupTypeAny;
  });

  const classNames = computed(() => {
    const schema = schemaRef.value;
    const { classnames: classNamesProp, suppressStandardClassnames } = schema;
    const isOver = props.isOver ?? false;
    const dropEffect = props.dropEffect ?? 'move';
    const dropNotAllowed = props.dropNotAllowed ?? false;
    return {
      header: clsx(
        suppressStandardClassnames || standardClassnames.header,
        classNamesProp.header,
        isOver && dropEffect === 'copy' && classNamesProp.dndCopy,
        dropNotAllowed && classNamesProp.dndDropNotAllowed,
        suppressStandardClassnames || {
          [standardClassnames.dndOver]: isOver,
          [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
          [standardClassnames.dndDropNotAllowed]: dropNotAllowed,
        }
      ),
      shiftActions: clsx(
        suppressStandardClassnames || standardClassnames.shiftActions,
        classNamesProp.shiftActions
      ),
      dragHandle: clsx(
        suppressStandardClassnames || standardClassnames.dragHandle,
        classNamesProp.dragHandle
      ),
      combinators: clsx(
        suppressStandardClassnames || standardClassnames.combinators,
        classNamesProp.valueSelector,
        classNamesProp.combinators
      ),
      notToggle: clsx(
        suppressStandardClassnames || standardClassnames.notToggle,
        classNamesProp.notToggle
      ),
      addRule: clsx(
        suppressStandardClassnames || standardClassnames.addRule,
        classNamesProp.actionElement,
        classNamesProp.addRule
      ),
      addGroup: clsx(
        suppressStandardClassnames || standardClassnames.addGroup,
        classNamesProp.actionElement,
        classNamesProp.addGroup
      ),
      cloneGroup: clsx(
        suppressStandardClassnames || standardClassnames.cloneGroup,
        classNamesProp.actionElement,
        classNamesProp.cloneGroup
      ),
      lockGroup: clsx(
        suppressStandardClassnames || standardClassnames.lockGroup,
        classNamesProp.actionElement,
        classNamesProp.lockGroup
      ),
      muteGroup: clsx(
        suppressStandardClassnames || standardClassnames.muteGroup,
        classNamesProp.actionElement,
        classNamesProp.muteGroup
      ),
      removeGroup: clsx(
        suppressStandardClassnames || standardClassnames.removeGroup,
        classNamesProp.actionElement,
        classNamesProp.removeGroup
      ),
      body: clsx(suppressStandardClassnames || standardClassnames.body, classNamesProp.body),
    };
  });

  const onCombinatorChange = (value: string) => {
    if (!disabled.value) {
      schemaRef.value.actions.onPropChange('combinator', value, props.path);
    }
  };

  const onIndependentCombinatorChange = (value: string, index: number, _context?: unknown) => {
    if (!disabled.value) {
      schemaRef.value.actions.onPropChange('combinator', value, [...props.path, index]);
    }
  };

  const onNotToggleChange = (checked: boolean, _context?: unknown) => {
    if (!disabled.value) {
      schemaRef.value.actions.onPropChange('not', checked, props.path);
    }
  };

  const addRule = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      const newRule = schemaRef.value.createRule();
      schemaRef.value.actions.onRuleAdd(newRule, props.path, context);
    }
  };

  const onGroupAdd = (group: RuleGroupTypeAny, parentPath: Path, context?: unknown) => {
    schemaRef.value.actions.onGroupAdd(group, parentPath, context);
  };

  const addGroup = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      const newGroup = schemaRef.value.createRuleGroup();
      onGroupAdd(newGroup, props.path, context);
    }
  };

  const cloneGroup = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      const newPath = [...getParentPath(props.path), props.path.at(-1)! + 1];
      schemaRef.value.actions.moveRule(props.path, newPath, true, context);
    }
  };

  const shiftGroupUp = (event?: MouseEvent, _context?: unknown) => {
    if (!disabled.value && !props.shiftUpDisabled) {
      schemaRef.value.actions.moveRule(props.path, 'up', event?.altKey, _context);
    }
  };

  const shiftGroupDown = (event?: MouseEvent, _context?: unknown) => {
    if (!disabled.value && !props.shiftDownDisabled) {
      schemaRef.value.actions.moveRule(props.path, 'down', event?.altKey, _context);
    }
  };

  const toggleLockGroup = (event?: MouseEvent, context?: unknown) => {
    schemaRef.value.actions.onPropChange('disabled', !disabled.value, props.path, context);
  };

  const toggleMuteGroup = (event?: MouseEvent, context?: unknown) => {
    schemaRef.value.actions.onPropChange('muted', !ruleGroup.value.muted, props.path, context);
  };

  const removeGroup = (event?: MouseEvent, context?: unknown) => {
    if (!disabled.value) {
      schemaRef.value.actions.onGroupRemove(props.path);
    }
  };

  const validationResult = computed(() => {
    const schema = schemaRef.value;
    const mapResult = schema.validationMap?.[props.id ?? ''];
    if (mapResult !== undefined) return mapResult;
    const rg = ruleGroup.value;
    const schemaValidator = schema.validator;
    if (typeof schemaValidator === 'function' && rg) {
      const v = schemaValidator(rg);
      if (typeof v === 'boolean') return v;
      if (v && typeof v === 'object' && 'valid' in v) return v as ValidationResult;
    }
    return undefined;
  }) as ComputedRef<boolean | ValidationResult | undefined>;
  const validationClassName = computed(() => getValidationClassNames(validationResult.value ?? true));
  const combinatorBasedClassName = computed(() => {
    const schema = schemaRef.value;
    return schema.independentCombinators ? '' : (getOption(schema.combinators, combinator.value)?.className ?? '');
  });

  const ruleGroupClassname = computed(() => schemaRef.value.getRuleGroupClassname?.(ruleGroup.value) ?? '');

  const outerClassName = computed(() => {
    const schema = schemaRef.value;
    const { classnames: classNamesProp, suppressStandardClassnames: sup } = schema;
    const isDragging = props.isDragging ?? false;
    const isOver = props.isOver ?? false;
    const groupItems = props.groupItems ?? false;
    return clsx(
      ruleGroupClassname.value,
      combinatorBasedClassName.value || undefined,
      sup || standardClassnames.ruleGroup,
      classNamesProp.ruleGroup,
      disabled.value && classNamesProp.disabled,
      muted.value && classNamesProp.muted,
      isDragging && classNamesProp.dndDragging,
      isOver && groupItems && classNamesProp.dndGroup,
      sup || {
        [standardClassnames.disabled]: disabled.value,
        [standardClassnames.muted]: muted.value,
        [standardClassnames.dndDragging]: isDragging,
        [standardClassnames.dndGroup]: isOver && groupItems,
      },
      validationClassName.value
    );
  });

  const pathsMemo = usePathsMemo(() => ({
    disabled: disabled.value,
    disabledPaths: schemaRef.value.disabledPaths,
    path: props.path,
    nestedArray: ruleGroup.value.rules,
  }));

  const accessibleDescription = computed(() =>
    schemaRef.value.accessibleDescriptionGenerator({ path: props.path, qbId: schemaRef.value.qbId })
  );

  return {
    addGroup,
    addRule,
    accessibleDescription,
    classNames,
    cloneGroup,
    combinator,
    disabled,
    muted,
    onCombinatorChange,
    onGroupAdd,
    onIndependentCombinatorChange,
    onNotToggleChange,
    outerClassName,
    pathsMemo,
    removeGroup,
    ruleGroup,
    shiftGroupDown,
    shiftGroupUp,
    toggleLockGroup,
    toggleMuteGroup,
    validationClassName,
    validationResult,
  };
}
