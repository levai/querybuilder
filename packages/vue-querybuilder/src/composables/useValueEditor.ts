import type { FullField, InputType, ParseNumberMethod } from '@react-querybuilder/core';
import {
  clsx,
  getFirstOption,
  getParseNumberMethod,
  joinWith,
  parseNumber,
  standardClassnames,
  toArray,
} from '@react-querybuilder/core';
import { computed, watch } from 'vue';
import type { Schema, ValueEditorProps } from '../types';

export interface UseValueEditor {
  /**
   * Array of values for when the main value represents a list, e.g. when operator
   * is "between" or "in".
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  valueAsArray: any[];
  /**
   * An update handler for a series of value editors, e.g. when operator is "between".
   * Calling this function will update a single element of the value array and leave
   * the rest of the array as is.
   *
   * @param {string} val The new value for the editor
   * @param {number} idx The index of the editor (and the array element to update)
   */
  multiValueHandler: (val: unknown, idx: number) => void;
  /**
   * An update handler for bigint editors, e.g. when `inputType` is "bigint" and
   * `parseNumberMethod` is truthy.
   */
  bigIntValueHandler: (val: unknown) => void;
  /**
   * Evaluated `parseNumber` method based on `parseNumbers` prop. This property ends up
   * being the same as the `parseNumbers` prop minus the "-limited" suffix, unless
   * the "-limited" suffix is present and the `inputType` is not "number", in which case
   * it's set to `false`.
   */
  parseNumberMethod: ParseNumberMethod;
  /**
   * Class for items in a value editor series (e.g. "between" value editors).
   */
  valueListItemClassName: string;
  /**
   * Coerced `inputType` based on `inputType` and `operator`.
   */
  inputTypeCoerced: InputType;
}

/**
 * This hook is primarily concerned with multi-value editors like date range
 * pickers, editors for 'in' and 'between' operators, etc.
 *
 * @returns The value as an array (`valueAsArray`), a change handler for
 * series of editors (`multiValueHandler`), a processed version of the
 * `parseNumbers` prop (`parseNumberMethod`), and the classname(s) to be applied
 * to each editor in editor series (`valueListItemClassName`).
 *
 * **NOTE:** The following logic only applies if `skipHook` is not `true`. To avoid
 * automatically updating the `value`, pass `{ skipHook: true }`.
 *
 * If the `value` is an array of non-zero length, the `operator` is _not_ one of
 * the known multi-value operators ("between", "notBetween", "in", "notIn"), and
 * the `type` is not "multiselect", then the `value` will be set to the first
 * element of the array (i.e., `value[0]`).
 *
 * The same thing will happen if `inputType` is "number" and `value` is a string
 * containing a comma, since `<input type="number">` doesn't handle commas.
 *
 * @group Composables
 */
export const useValueEditor = <F extends FullField = FullField, O extends string = string>(
  props: ValueEditorProps<F, O>
): UseValueEditor => {
  const {
    handleOnChange,
    inputType,
    operator,
    value,
    listsAsArrays,
    parseNumbers,
    values,
    type,
    skipHook,
    schema: { classNames: classNamesProp, suppressStandardClassnames },
  } = props;

  watch(
    () => [skipHook, type, operator, value, inputType],
    () => {
      if (
        !skipHook &&
        type !== 'multiselect' &&
        !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
        (Array.isArray(value) ||
          (inputType === 'number' && typeof value === 'string' && value.includes(',')))
      ) {
        handleOnChange(toArray(value, { retainEmptyStrings: true })[0] ?? '');
      }
    },
    { immediate: true }
  );

  const valueAsArray = computed(() => toArray(value, { retainEmptyStrings: true })).value;

  const parseNumberMethod = computed(() =>
    getParseNumberMethod({ parseNumbers, inputType })
  ).value;

  const multiValueHandler = (val: unknown, idx: number) => {
    const parsedVal = parseNumber(val, { parseNumbers: parseNumberMethod });
    const needsBetweenFix =
      idx === 0 &&
      (operator === 'between' || operator === 'notBetween') &&
      (valueAsArray.length < 2 || valueAsArray[1] === undefined);
    // Check if value at index is already the same and no between/notBetween fix needed
    if (valueAsArray[idx] === parsedVal && !needsBetweenFix) {
      // Return the array as-is
      handleOnChange(listsAsArrays ? valueAsArray : joinWith(valueAsArray, ','));
      return;
    }
    const v = [...valueAsArray];
    v[idx] = parsedVal;
    // Enforce an array length of (at least) two for "between"/"notBetween"
    if (needsBetweenFix) {
      v[1] = getFirstOption(values);
    }
    handleOnChange(listsAsArrays ? v : joinWith(v, ','));
  };

  const bigIntValueHandler = (v: unknown) => {
    const valAsMaybeNumber = parseNumber(v, {
      parseNumbers: parseNumberMethod,
      bigIntOnOverflow: true,
    });
    let bi: bigint;
    try {
      bi = BigInt(valAsMaybeNumber);
    } catch {
      handleOnChange(valAsMaybeNumber);
      return;
    }
    handleOnChange(bi);
  };

  const valueListItemClassName = clsx(
    suppressStandardClassnames || standardClassnames.valueListItem,
    // Optional chaining is necessary for QueryBuilderNative
    classNamesProp?.valueListItem
  );

  const inputTypeCoerced =
    inputType === 'bigint' || operator === 'in' || operator === 'notIn'
      ? 'text'
      : inputType || 'text';

  return {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    parseNumberMethod,
    valueListItemClassName,
    inputTypeCoerced,
  };
};
