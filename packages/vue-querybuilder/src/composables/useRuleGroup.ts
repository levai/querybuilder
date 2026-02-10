import type {
  ActionElementEventHandler,
  Classnames,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  ValidationResult,
  ValueChangeEventHandler,
} from '@react-querybuilder/core';
import {
  clsx,
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  isRuleGroupType,
  pathsAreEqual,
  standardClassnames,
} from '@react-querybuilder/core';
import { computed, type ComputedRef } from 'vue';
import { useDeprecatedProps } from './useDeprecatedProps';
import { useReactDndWarning } from './useReactDndWarning';
import type { RuleGroupProps } from '../types';

/* oxlint-disable typescript/no-explicit-any */
export interface UseRuleGroup extends RuleGroupProps {
  addGroup: ActionElementEventHandler;
  addRule: ActionElementEventHandler;
  accessibleDescription: string;
  muted?: boolean;
  classNames: Pick<
    { [k in keyof Classnames]: string },
    | 'header'
    | 'shiftActions'
    | 'dragHandle'
    | 'combinators'
    | 'notToggle'
    | 'addRule'
    | 'addGroup'
    | 'cloneGroup'
    | 'lockGroup'
    | 'muteGroup'
    | 'removeGroup'
    | 'body'
  >;
  cloneGroup: ActionElementEventHandler;
  onCombinatorChange: ValueChangeEventHandler;
  onGroupAdd: (group: RuleGroupTypeAny, parentPath: Path, context?: any) => void;
  onIndependentCombinatorChange: (value: any, index: number, context?: any) => void;
  onNotToggleChange: (checked: boolean, context?: any) => void;
  outerClassName: string;
  pathsMemo: ComputedRef<{ path: Path; disabled: boolean }[]>;
  removeGroup: ActionElementEventHandler;
  ruleGroup: RuleGroupType | RuleGroupTypeIC;
  shiftGroupDown: (event?: MouseEvent, context?: any) => void;
  shiftGroupUp: (event?: MouseEvent, context?: any) => void;
  toggleLockGroup: ActionElementEventHandler;
  toggleMuteGroup: ActionElementEventHandler;
  validationClassName: string;
  validationResult: boolean | ValidationResult;
}
/* oxlint-enable typescript/no-explicit-any */

export interface UseRuleGroupProps extends RuleGroupProps {}

/**
 * Prepares all values and methods used by the {@link RuleGroup} component.
 *
 * @group Composables
 */
export const useRuleGroup = (props: UseRuleGroupProps): UseRuleGroup => {
  const {
    id,
    path,
    ruleGroup: ruleGroupProp,
    schema: {
      qbId,
      accessibleDescriptionGenerator,
      classNames: classNamesProp,
      combinators,
      createRule,
      createRuleGroup,
      disabledPaths,
      independentCombinators,
      validationMap,
      enableDragAndDrop,
      getRuleGroupClassname,
      suppressStandardClassnames,
    },
    actions: { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule },
    disabled: disabledProp,
    parentDisabled,
    parentMuted,
    shiftUpDisabled,
    shiftDownDisabled,
    combinator: combinatorProp,
    rules: rulesProp,
    not: notProp,
    // Drag-and-drop
    dropEffect = 'move',
    groupItems = false,
    dragMonitorId = '',
    dropMonitorId = '',
    previewRef = null,
    dragRef = null,
    dropRef = null,
    isDragging = false,
    isOver = false,
    dropNotAllowed = false,
  } = props;

  useDeprecatedProps('ruleGroup', !ruleGroupProp);

  useReactDndWarning(
    enableDragAndDrop,
    !!(dragMonitorId || dropMonitorId || previewRef || dragRef || dropRef)
  );

  const disabled = computed(() => !!parentDisabled || !!disabledProp).value;
  const muted = computed(() => !!parentMuted || !!ruleGroupProp?.muted).value;

  const combinator = computed(() =>
    ruleGroupProp && isRuleGroupType(ruleGroupProp)
      ? ruleGroupProp.combinator
      : ruleGroupProp
        ? getFirstOption(combinators)!
        : (combinatorProp ?? getFirstOption(combinators)!)
  ).value;

  // TODO?: Type this properly with generics
  const ruleGroup = computed((): RuleGroupTypeAny => {
    if (ruleGroupProp) {
      if (ruleGroupProp.combinator === combinator || independentCombinators) {
        return ruleGroupProp;
      }
      const newRG = structuredClone(ruleGroupProp);
      newRG.combinator = combinator;
      return newRG;
    }
    return { rules: rulesProp, not: notProp } as RuleGroupTypeIC;
  }).value;

  const classNames = computed(() => ({
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
  })).value;

  const onCombinatorChange: ValueChangeEventHandler = (value) => {
    if (!disabled) {
      onPropChange('combinator', value, path);
    }
  };

  const onIndependentCombinatorChange = (value: any, index: number, _context?: any) => {
    if (!disabled) {
      onPropChange('combinator', value, [...path, index]);
    }
  };

  const onNotToggleChange = (checked: boolean, _context?: any) => {
    if (!disabled) {
      onPropChange('not', checked, path);
    }
  };

  const addRule: ActionElementEventHandler = (_e, context) => {
    if (!disabled) {
      const newRule = createRule();
      onRuleAdd(newRule, path, context);
    }
  };

  const addGroup: ActionElementEventHandler = (_e, context) => {
    if (!disabled) {
      const newGroup = createRuleGroup();
      onGroupAdd(newGroup, path, context);
    }
  };

  const cloneGroup: ActionElementEventHandler = () => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path.at(-1)! + 1];
      moveRule(path, newPath, true);
    }
  };

  const shiftGroupUp = (event?: MouseEvent, _context?: any) => {
    if (!disabled && !shiftUpDisabled) {
      moveRule(path, 'up', event?.altKey);
    }
  };

  const shiftGroupDown = (event?: MouseEvent, _context?: any) => {
    if (!disabled && !shiftDownDisabled) {
      moveRule(path, 'down', event?.altKey);
    }
  };

  const toggleLockGroup: ActionElementEventHandler = () => {
    onPropChange('disabled', !disabled, path);
  };

  const toggleMuteGroup: ActionElementEventHandler = () => {
    onPropChange('muted', !ruleGroup.muted, path);
  };

  const removeGroup: ActionElementEventHandler = () => {
    if (!disabled) {
      onGroupRemove(path);
    }
  };

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = computed(() => getValidationClassNames(validationResult)).value;
  
  const combinatorBasedClassName = computed(() =>
    independentCombinators ? null : (getOption(combinators, combinator)?.className ?? '')
  ).value;

  const ruleGroupClassname = computed(() => getRuleGroupClassname(ruleGroup)).value;

  const outerClassName = computed(() =>
    clsx(
      ruleGroupClassname,
      combinatorBasedClassName,
      suppressStandardClassnames || standardClassnames.ruleGroup,
      classNamesProp.ruleGroup,
      disabled && classNamesProp.disabled,
      muted && classNamesProp.muted,
      isDragging && classNamesProp.dndDragging,
      isOver && groupItems && classNamesProp.dndGroup,
      suppressStandardClassnames || {
        [standardClassnames.disabled]: disabled,
        [standardClassnames.muted]: muted,
        [standardClassnames.dndDragging]: isDragging,
        [standardClassnames.dndGroup]: isOver && groupItems,
      },
      validationClassName
    )
  ).value;

  // IMPORTANT: pathsMemo must track changes to ruleGroupProp.rules (the prop)
  // Since ruleGroupProp comes from props, it's reactive. Access it directly in computed.
  const pathsMemo = computed(() => {
    // Access ruleGroupProp.rules to ensure reactivity when props change
    const rules = ruleGroupProp?.rules ?? rulesProp ?? [];
    const paths: { path: Path; disabled: boolean }[] = [];
    for (let i = 0; i < rules.length; i++) {
      const thisPath = [...path, i];
      paths[i] = {
        path: thisPath,
        disabled: disabled || disabledPaths.some(p => pathsAreEqual(thisPath, p)),
      };
    }
    return paths;
  });

  const accessibleDescription = computed(() =>
    accessibleDescriptionGenerator({ path, qbId })
  ).value;

  return {
    ...props,
    addGroup,
    addRule,
    accessibleDescription,
    classNames,
    cloneGroup,
    combinator,
    disabled,
    dragMonitorId,
    dragRef,
    dropMonitorId,
    dropRef,
    isDragging,
    isOver,
    muted,
    onCombinatorChange,
    onGroupAdd,
    onIndependentCombinatorChange,
    onNotToggleChange,
    outerClassName,
    parentDisabled,
    pathsMemo,
    previewRef,
    removeGroup,
    ruleGroup,
    shiftGroupUp,
    shiftGroupDown,
    toggleLockGroup,
    toggleMuteGroup,
    validationClassName,
    validationResult,
  };
};
