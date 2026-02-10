import { computed } from 'vue';
import type { ValueEditorProps, VersatileSelectorProps } from '../types';
import type { UseAsyncOptionListParams } from './useAsyncOptionList';

/**
 * Generates a cache key given the same props and params as {@link useAsyncOptionList}.
 *
 * @group Composables
 */
export const useAsyncCacheKey = <PropsType extends VersatileSelectorProps | ValueEditorProps>(
  props: PropsType,
  // istanbul ignore next
  { getCacheKey }: UseAsyncOptionListParams<PropsType> = {}
): string => {
  const ruleOrGroup = props.rule ?? (props as VersatileSelectorProps).ruleGroup;

  return computed(() => {
    if (typeof getCacheKey === 'string') {
      return String(ruleOrGroup?.[getCacheKey as 'id'] ?? '');
    }
    if (typeof getCacheKey === 'function') {
      return getCacheKey(props);
    }
    if (Array.isArray(getCacheKey) && getCacheKey.length > 0 && ruleOrGroup) {
      return getCacheKey.map(ck => `${ruleOrGroup[ck as 'id']}`).join('|');
    }
    return '';
  }).value;
};
