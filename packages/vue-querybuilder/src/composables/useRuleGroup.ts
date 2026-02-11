/**
 * RuleGroup composable — inject queryRef + path, compute ruleGroup via findPath.
 */
// @ts-nocheck - context schema ref typing
import {
  clsx,
  findPath,
  getFirstOption,
  getOption,
  isRuleGroup,
  isRuleGroupType,
  standardClassnames,
} from '@react-querybuilder/core';
import type { Path, RuleGroupTypeAny } from '@react-querybuilder/core';
import { computed, inject } from 'vue';
import { QUERY_REF_KEY, DISPATCH_KEY, QUERY_BUILDER_CONTEXT_KEY } from '../context/queryBuilderContext';
import { usePathsMemo } from './usePathsMemo';
import type { RuleGroupProps, Schema } from '../types';
import { getValidationClassNames } from '@react-querybuilder/core';

export interface UseRuleGroupPathOptions {
  path: Path;
  disabled?: boolean;
  parentDisabled?: boolean;
  parentMuted?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  /** 为 true 时仅渲染 header + body 两个 div，不包一层 ruleGroup 根（用于子 query 与 React 一致） */
  noRootWrapper?: boolean;
  context?: unknown;
}

export function useRuleGroup(options: UseRuleGroupPathOptions) {
  const queryRef = inject(QUERY_REF_KEY);
  const dispatch = inject(DISPATCH_KEY);
  const contextRef = inject(QUERY_BUILDER_CONTEXT_KEY);
  if (!queryRef || !dispatch || !contextRef) throw new Error('RuleGroup must be used within QueryBuilder');

  const pathRef = computed(() => options.path);
  const schemaRef = computed(() => {
    const ctx = contextRef.value as { schema?: { value?: Schema } };
    return ctx?.schema?.value ?? (contextRef.value as { schema?: Schema })?.schema;
  });
  const actionsRef = computed(() => (contextRef.value as { actions?: { value?: unknown } })?.actions?.value ?? (contextRef.value as { actions?: unknown })?.actions);

  const ruleGroupFromQuery = computed((): RuleGroupTypeAny | null => {
    const q = queryRef.value;
    if (!q || !isRuleGroup(q)) return null;
    if (pathRef.value.length === 0) return q;
    const node = findPath(pathRef.value, q);
    return node && isRuleGroup(node) ? node : null;
  });

  const disabledProp = computed(() => ruleGroupFromQuery.value?.disabled);
  const pathDisabled = computed(() => options.disabled ?? false);
  const parentDisabled = computed(() => options.parentDisabled ?? false);
  const parentMuted = computed(() => options.parentMuted ?? false);
  const disabled = computed(() => !!parentDisabled.value || !!pathDisabled.value || !!disabledProp.value);
  const muted = computed(() => !!parentMuted.value || !!ruleGroupFromQuery.value?.muted);

  const combinators = computed(() => schemaRef.value?.combinators ?? []);
  const combinator = computed(() => {
    const rg = ruleGroupFromQuery.value;
    if (rg && isRuleGroupType(rg)) return rg.combinator;
    return rg ? (getFirstOption(combinators.value) as string) : (getFirstOption(combinators.value) as string);
  });

  const ruleGroup = computed(() => ruleGroupFromQuery.value);
  const id = computed(() => ruleGroup.value?.id ?? '');
  const disabledPaths = computed(() => schemaRef.value?.disabledPaths ?? []);
  const pathsMemo = usePathsMemo({
    disabled,
    path: pathRef,
    nestedArray: computed(() => ruleGroup.value?.rules ?? []),
    disabledPaths,
  });

  const onPropChange = (prop: string, value: unknown, path: Path) => {
    const allow = !disabled.value || prop === 'disabled' || prop === 'muted';
    if (allow) (actionsRef.value as { onPropChange?: (p: string, v: unknown, path: Path) => void })?.onPropChange?.(prop, value, path);
  };
  const onRuleAdd = (rule: unknown, parentPath: Path) => {
    if (!disabled.value) (actionsRef.value as { onRuleAdd?: (r: unknown, p: Path) => void })?.onRuleAdd?.(rule, parentPath);
  };
  const onGroupAdd = (group: unknown, parentPath: Path) => {
    if (!disabled.value) (actionsRef.value as { onGroupAdd?: (g: unknown, p: Path) => void })?.onGroupAdd?.(group, parentPath);
  };
  const onGroupRemove = (path: Path) => {
    if (!disabled.value) (actionsRef.value as { onGroupRemove?: (p: Path) => void })?.onGroupRemove?.(path);
  };
  const moveRule = (from: Path, to: Path | 'up' | 'down', clone?: boolean) => {
    if (!disabled.value) (actionsRef.value as { moveRule?: (a: Path, b: Path | 'up' | 'down', c?: boolean) => void })?.moveRule?.(from, to, clone);
  };

  const createRule = () => schemaRef.value?.createRule?.();
  const createRuleGroup = () => schemaRef.value?.createRuleGroup?.();

  const addRule = (_e?: MouseEvent, _context?: unknown) => {
    if (!disabled.value && createRule) onRuleAdd(createRule(), pathRef.value);
  };
  const addGroup = (_e?: MouseEvent, _context?: unknown) => {
    if (!disabled.value && createRuleGroup) onGroupAdd(createRuleGroup(), pathRef.value);
  };
  const removeGroup = () => {
    if (!disabled.value) onGroupRemove(pathRef.value);
  };
  const cloneGroup = () => {
    if (!disabled.value) {
      const p = pathRef.value;
      const newPath = p.length ? [...p.slice(0, -1), p[p.length - 1] + 1] : [1];
      moveRule(pathRef.value, newPath, true);
    }
  };
  const onCombinatorChange = (value: string) => onPropChange('combinator', value, pathRef.value);
  const onIndependentCombinatorChange = (value: string, index: number) => {
    if (!disabled.value) onPropChange('combinator', value, [...pathRef.value, index]);
  };
  const onNotToggleChange = (checked: boolean) => onPropChange('not', checked, pathRef.value);
  const toggleLockGroup = () => onPropChange('disabled', !disabled.value, pathRef.value);
  const toggleMuteGroup = () => onPropChange('muted', !ruleGroup.value?.muted, pathRef.value);
  const shiftUpDisabled = computed(() => options.shiftUpDisabled ?? false);
  const shiftDownDisabled = computed(() => options.shiftDownDisabled ?? false);
  const shiftGroupUp = () => { if (!disabled.value && !shiftUpDisabled.value) moveRule(pathRef.value, 'up'); };
  const shiftGroupDown = () => { if (!disabled.value && !shiftDownDisabled.value) moveRule(pathRef.value, 'down'); };

  const classNamesProp = computed(() => (schemaRef.value?.classNames ?? {}) as Record<string, string>);
  const suppressStandardClassnames = computed(() => schemaRef.value?.suppressStandardClassnames ?? false);
  const validationMap = computed(() => schemaRef.value?.validationMap ?? {});
  const validationResult = computed(() => validationMap.value[id.value] ?? null);
  const validationClassName = computed(() => getValidationClassNames(validationResult.value));
  const getRuleGroupClassnameFn = computed(() => schemaRef.value?.getRuleGroupClassname ?? (() => ''));

  const classNames = computed(() => ({
    header: clsx(suppressStandardClassnames.value || standardClassnames.header, classNamesProp.value?.header),
    body: clsx(suppressStandardClassnames.value || standardClassnames.body, classNamesProp.value?.body),
    addRule: clsx(standardClassnames.addRule, classNamesProp.value?.addRule),
    addGroup: clsx(standardClassnames.addGroup, classNamesProp.value?.addGroup),
    combinators: clsx(suppressStandardClassnames.value || standardClassnames.combinators, classNamesProp.value?.combinators),
    notToggle: clsx(suppressStandardClassnames.value || standardClassnames.notToggle, classNamesProp.value?.notToggle),
    cloneGroup: clsx(standardClassnames.cloneGroup, classNamesProp.value?.cloneGroup),
    lockGroup: clsx(suppressStandardClassnames.value || standardClassnames.lockGroup, classNamesProp.value?.lockGroup),
    muteGroup: clsx(suppressStandardClassnames.value || standardClassnames.muteGroup, classNamesProp.value?.muteGroup),
    removeGroup: clsx(suppressStandardClassnames.value || standardClassnames.removeGroup, classNamesProp.value?.removeGroup),
    shiftActions: clsx(standardClassnames.shiftActions, classNamesProp.value?.shiftActions),
    dragHandle: clsx(suppressStandardClassnames.value || standardClassnames.dragHandle, classNamesProp.value?.dragHandle),
  }));

  const outerClassName = computed(() =>
    clsx(
      ruleGroup.value ? getRuleGroupClassnameFn.value(ruleGroup.value) : '',
      suppressStandardClassnames.value || standardClassnames.ruleGroup,
      classNamesProp.value?.ruleGroup,
      disabled.value && classNamesProp.value?.disabled,
      muted.value && classNamesProp.value?.muted,
      validationClassName.value
    )
  );

  const translations = computed(() => (contextRef.value as { translations?: { value?: RuleGroupProps['translations'] } })?.translations?.value ?? (contextRef.value as { translations?: RuleGroupProps['translations'] })?.translations ?? {});

  const accessibleDescription = computed(() => {
    const gen = (schemaRef.value as { accessibleDescriptionGenerator?: (opts: { path: Path; qbId: string }) => string })?.accessibleDescriptionGenerator;
    if (typeof gen !== 'function') return '';
    return gen({ path: pathRef.value, qbId: (schemaRef.value as { qbId?: string })?.qbId ?? '' });
  });

  return {
    path: pathRef,
    accessibleDescription,
    parentDisabled,
    parentMuted: parentMuted as unknown as typeof parentDisabled,
    ruleGroup,
    id,
    disabled,
    muted,
    combinator,
    classNames,
    outerClassName,
    pathsMemo,
    translations,
    schema: schemaRef,
    addRule,
    addGroup,
    removeGroup,
    onCombinatorChange,
    onIndependentCombinatorChange,
    onNotToggleChange,
    toggleLockGroup,
    toggleMuteGroup,
    cloneGroup,
    shiftGroupUp,
    shiftGroupDown,
    shiftUpDisabled,
    shiftDownDisabled,
    validationResult,
    validationClassName,
  };
}
