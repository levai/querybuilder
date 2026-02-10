import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { messages } from '../messages';
import { usePrevious } from './usePrevious';

export interface UseControlledOrUncontrolledParams {
  defaultQuery?: RuleGroupTypeAny;
  modelValue?: RuleGroupTypeAny;
}

/**
 * Logs a warning when the component changes from controlled to uncontrolled,
 * vice versa, or both `modelValue` and `defaultQuery` are provided.
 *
 * @group Composables
 */
export const useControlledOrUncontrolled = (
  params: UseControlledOrUncontrolledParams
): void => {
  const { defaultQuery, modelValue } = params;
  const prevQueryPresent = usePrevious(!!modelValue);

  // istanbul ignore else
  if (process.env.NODE_ENV !== 'production') {
    if (!!modelValue && !!defaultQuery) {
      console.warn(messages.errorBothQueryDefaultQuery);
    } else if (prevQueryPresent.value === true && !modelValue && !!defaultQuery) {
      console.warn(messages.errorControlledToUncontrolled);
    } else if (prevQueryPresent.value === false && !!modelValue && !defaultQuery) {
      console.warn(messages.errorUncontrolledToControlled);
    }
  }
};
