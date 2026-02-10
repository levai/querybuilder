import { joinWith, toArray } from '@react-querybuilder/core';
import type { ValueSelectorProps } from '../types';

export type UseValueSelectorParams = Pick<
  ValueSelectorProps,
  'handleOnChange' | 'listsAsArrays' | 'multiple'
> & {
  value: ValueSelectorProps['value'];
};

/**
 * Transforms a value into an array when appropriate and provides a memoized change handler.
 *
 * @group Composables
 */
export const useValueSelector = (
  props: UseValueSelectorParams
): {
  /**
   * Memoized change handler for value selectors
   */
  onChange: (v: string | string[]) => void;
} => {
  const { handleOnChange, listsAsArrays = false, multiple = false } = props;

  const onChange = (v: string | string[]) => {
    if (multiple) {
      const valueAsArray = toArray(v);
      handleOnChange(listsAsArrays ? valueAsArray : joinWith(valueAsArray, ','));
    } else {
      handleOnChange(v);
    }
  };

  return {
    onChange,
  };
};
