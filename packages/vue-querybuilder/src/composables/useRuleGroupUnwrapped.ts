/**
 * Unwraps useRuleGroup return value for use in RuleGroupHeaderComponents / RuleGroupBodyComponents.
 * Accepts Ref or ComputedRef of the rg object so header/body can stay reactive.
 */
import type { Ref, ComputedRef } from 'vue';
import { computed, unref } from 'vue';

function unwrapRef<T>(v: T | { value?: T } | undefined): T {
  if (v != null && typeof v === 'object' && 'value' in v) return (v as { value: T }).value as T;
  return v as T;
}

export function useRuleGroupUnwrapped(
  rgRef: Ref<unknown> | ComputedRef<unknown>
) {
  const rg = computed(() => unref(rgRef));
  const classNamesVal = computed(() => (unwrapRef(rg.value && (rg.value as { classNames?: unknown }).classNames) ?? {}) as Record<string, string>);
  const ruleGroupVal = computed(() => unwrapRef(rg.value && (rg.value as { ruleGroup?: unknown }).ruleGroup));
  const schemaVal = computed(() => unwrapRef(rg.value && (rg.value as { schema?: unknown }).schema));
  const pathsMemoArray = computed(() => (unwrapRef(rg.value && (rg.value as { pathsMemo?: unknown }).pathsMemo) ?? []) as { path: number[]; disabled: boolean }[]);
  const disabledVal = computed(() => !!unwrapRef(rg.value && (rg.value as { disabled?: unknown }).disabled));
  const parentDisabledVal = computed(() => !!unwrapRef(rg.value && (rg.value as { parentDisabled?: unknown }).parentDisabled));
  const parentMutedVal = computed(() => !!unwrapRef(rg.value && (rg.value as { parentMuted?: unknown }).parentMuted));
  const combinatorVal = computed(() => (unwrapRef(rg.value && (rg.value as { combinator?: unknown }).combinator) ?? '') as string);
  const path = computed(() => (rg.value && (rg.value as { path?: unknown }).path) ?? []);
  const translationsVal = computed(() => (unwrapRef(rg.value && (rg.value as { translations?: unknown }).translations) ?? {}) as Record<string, unknown>);
  const validationResultVal = computed(() => unwrapRef(rg.value && (rg.value as { validationResult?: unknown }).validationResult));

  const schemaForControls = computed(() => {
    const s = schemaVal.value;
    const raw = s && typeof s === 'object' && 'value' in s ? (s as { value?: Record<string, unknown> }).value : (s as Record<string, unknown> | undefined);
    return (raw ?? {}) as { combinators?: unknown[]; showLockButtons?: boolean; controls?: { ruleGroup?: unknown }; showCombinatorsBetweenRules?: boolean; independentCombinators?: boolean };
  });
  const showCombinatorsBetweenRulesVal = computed(() => !!schemaForControls.value?.showCombinatorsBetweenRules);
  const independentCombinatorsVal = computed(() => !!schemaForControls.value?.independentCombinators);
  const combinatorsList = computed(() => (schemaForControls.value?.combinators ?? []) as { name: string; label: string }[]);
  const showLockButtonsVal = computed(() => !!schemaForControls.value?.showLockButtons);
  const RuleGroupRecursive = computed(() => schemaForControls.value?.controls?.ruleGroup);

  return {
    rg,
    classNamesVal,
    ruleGroupVal,
    schemaVal,
    schemaForControls,
    pathsMemoArray,
    disabledVal,
    parentDisabledVal,
    parentMutedVal,
    combinatorVal,
    path,
    translationsVal,
    validationResultVal,
    showCombinatorsBetweenRulesVal,
    independentCombinatorsVal,
    combinatorsList,
    showLockButtonsVal,
    RuleGroupRecursive,
  };
}
