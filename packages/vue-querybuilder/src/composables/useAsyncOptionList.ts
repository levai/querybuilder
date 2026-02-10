import type {
  BaseOption,
  FlexibleOptionListProp,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { clsx, standardClassnames } from '@react-querybuilder/core';
import { computed, watch } from 'vue';
import type { ValueEditorProps, VersatileSelectorProps } from '../types';
import {
  getCacheByKey,
  getErrorByKey,
  isCacheValid,
  isLoadingByKey,
  loadOptionList,
} from '../state/asyncOptionListsStore';
import { useAsyncCacheKey } from './useAsyncCacheKey';

export * from './useAsyncCacheKey';

export interface UseAsyncOptionListParams<
  PropsType extends VersatileSelectorProps | ValueEditorProps,
> {
  /**
   * Cache "time to live"—milliseconds after initial retrieval for which the cache is valid.
   *
   * To avoid caching, set this to zero. (Loaded option lists will always be cached, but
   * a cache with zero TTL will be immediately invalidated, effectively disabling caching.)
   *
   * @default 1_800_000 // 30 minutes
   */
  cacheTTL?: number;
  /**
   * Can be one of the following:
   * 1. The rule/group attribute to use as the cache key (`string`),
   * 2. A list of rule/group attributes to use as the cache key (`string[]`), or
   * 3. A function that generates the cache key based on the props (`(props: PropsType) => string`).
   *
   * **IMPORTANT**: If providing an array of property names, do NOT include the property
   * that `value` represents unless you are generating an auto-complete component. For example,
   * if the value selector will be assigned as `fieldSelector`, do not include 'field' in this
   * array. Same for 'operator' and `operatorSelector`, etc.
   *
   * @default ''
   */
  getCacheKey?: string | string[] | ((props: PropsType) => string);
  /**
   * Returns a promise for the set of options to be used.
   */
  loadOptionList?: (
    /** Current value of the selector. */
    value: string | undefined,
    meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
  ) => Promise<FlexibleOptionListProp<BaseOption>>;
  /**
   * Forces "loading" state, even if the selector is not currently waiting for `loadOptionList` to resolve.
   */
  isLoading?: boolean;
}

export type UseAsyncOptionList<PropsType> = PropsType & {
  /**
   * Whether the selector is currently loading options.
   */
  isLoading: boolean;
  /**
   * Error messages of rejected `loadOptionList` promises.
   */
  errors: string | null;
};

/**
 * Augments a {@link ValueSelectorProps} object with async option loading.
 *
 * @group Composables
 */
export function useAsyncOptionList(
  props: VersatileSelectorProps,
  params?: UseAsyncOptionListParams<VersatileSelectorProps>
): UseAsyncOptionList<VersatileSelectorProps>;
/**
 * Augments a {@link ValueEditorProps} object with async option (`values`) loading.
 *
 * @group Composables
 */
export function useAsyncOptionList(
  props: ValueEditorProps,
  params?: UseAsyncOptionListParams<ValueEditorProps>
): UseAsyncOptionList<ValueEditorProps>;
export function useAsyncOptionList<PropsType extends VersatileSelectorProps | ValueEditorProps>(
  props: PropsType,
  params: UseAsyncOptionListParams<PropsType> = {}
) {
  const { cacheTTL, loadOptionList: loadOptionListFn, isLoading: isLoadingProp } = params;
  const {
    options: optionsProp,
    values: valuesProp,
    value,
  } = props as VersatileSelectorProps & ValueEditorProps;

  const ruleOrGroup = props.rule ?? (props as VersatileSelectorProps).ruleGroup;

  const cacheKey = useAsyncCacheKey(props, params);

  const cached = computed(() => getCacheByKey(cacheKey)).value;
  const cacheIsValid = cached ? isCacheValid(cacheKey, cacheTTL) : false;

  const options = cached?.data ?? optionsProp ?? valuesProp;

  const isLoading = computed(
    () => isLoadingProp || isLoadingByKey(cacheKey)
  ).value;

  const errors = computed(() => getErrorByKey(cacheKey)).value;

  const className = computed(() =>
    clsx(
      props.className,
      isLoading && [
        props.schema.suppressStandardClassnames || standardClassnames.loading,
        props.schema.classNames.loading,
      ]
    )
  ).value;

  watch(
    () => [cacheKey, isLoading, cacheIsValid, cached, errors, loadOptionListFn, value, ruleOrGroup],
    () => {
      if (
        !isLoading &&
        (!cacheIsValid || !cached) &&
        !errors &&
        typeof loadOptionListFn === 'function'
      ) {
        loadOptionList(cacheKey, cacheTTL, value, ruleOrGroup, loadOptionListFn).catch(() => {
          // Error is already handled in the store
        });
      }
    },
    { immediate: true }
  );

  return {
    ...props,
    ...(optionsProp ? { options } : { values: options }),
    className,
    isLoading,
    errors,
  };
}
