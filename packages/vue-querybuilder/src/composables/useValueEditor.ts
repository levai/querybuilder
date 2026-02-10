import {
  getFirstOption,
  getParseNumberMethod,
  joinWith,
  parseNumber,
  standardClassnames,
  toArray,
} from '@react-querybuilder/core';
import type { InputType, ParseNumberMethod, FullOption } from '@react-querybuilder/core';
import type { MaybeRefOrGetter } from 'vue';
import { computed, type ComputedRef, toValue, watch } from 'vue';
import type { ParseNumbersPropConfig } from '@react-querybuilder/core';

export interface UseValueEditorProps {
  value: MaybeRefOrGetter<string | number | boolean | (string | null)[]>;
  operator: MaybeRefOrGetter<string>;
  handleOnChange: (v: unknown) => void;
  inputType?: MaybeRefOrGetter<InputType | null | undefined>;
  listsAsArrays?: MaybeRefOrGetter<boolean | undefined>;
  parseNumbers?: MaybeRefOrGetter<ParseNumbersPropConfig | undefined>;
  values?: MaybeRefOrGetter<Array<{ value?: string; name?: string; label?: string }>>;
  type?: MaybeRefOrGetter<string | undefined>;
  skipHook?: boolean;
  classNamesProp?: { valueListItem?: string };
  suppressStandardClassnames?: boolean;
}

export interface UseValueEditor {
  valueAsArray: ComputedRef<(string | number | null)[]>;
  multiValueHandler: (val: unknown, idx: number) => void;
  parseNumberMethod: ComputedRef<ParseNumberMethod>;
  valueListItemClassName: string;
  /** Ref so template stays reactive to operator/inputType changes */
  inputTypeCoerced: ComputedRef<InputType | 'text'>;
}

/**
 * Composable for ValueEditor: value as array, multi-value handler, parseNumber method.
 * Aligns with React useValueEditor (array cleanup when operator changes, between fix).
 */
export function useValueEditor(props: UseValueEditorProps): UseValueEditor {
  const {
    value,
    operator,
    handleOnChange,
    inputType,
    listsAsArrays,
    parseNumbers,
    values,
    type,
    skipHook,
    classNamesProp,
    suppressStandardClassnames,
  } = props;

  const valueAsArray = computed(() =>
    toArray(toValue(value), { retainEmptyStrings: true })
  );

  const parseNumberMethod = computed(() => {
    const pn = toValue(parseNumbers);
    const it = toValue(inputType);
    return getParseNumberMethod({ parseNumbers: pn, inputType: it ?? null });
  });

  // Array cleanup: when operator is not multi-value and value is array, reset to first element
  watch(
    [() => toValue(operator), () => toValue(value)],
    () => {
      if (skipHook) return;
      const t = toValue(type) ?? 'text';
      if (t === 'multiselect') return;
      const op = toValue(operator);
      if (['between', 'notBetween', 'in', 'notIn'].includes(op)) return;
      const val = toValue(value);
      const it = toValue(inputType);
      const isArray = Array.isArray(val);
      const hasComma =
        it === 'number' && typeof val === 'string' && (val as string).includes(',');
      if (isArray || hasComma) {
        const arr = toArray(val, { retainEmptyStrings: true });
        handleOnChange(arr[0] ?? '');
      }
    },
    { immediate: true }
  );

  const multiValueHandler = (val: unknown, idx: number) => {
    const method = parseNumberMethod.value;
    const parsedVal = parseNumber(val, { parseNumbers: method });
    const arr = valueAsArray.value;
    const op = toValue(operator);
    const la = toValue(listsAsArrays);
    const vals = toValue(values) ?? [];
    const needsBetweenFix =
      idx === 0 &&
      (op === 'between' || op === 'notBetween') &&
      (arr.length < 2 || arr[1] === undefined);
    if (arr[idx] === parsedVal && !needsBetweenFix) {
      handleOnChange(la ? arr : joinWith(arr, ','));
      return;
    }
    const v = [...arr];
    v[idx] = parsedVal;
    if (needsBetweenFix) {
      v[1] = getFirstOption(vals as FullOption[]) ?? '';
    }
    handleOnChange(la ? v : joinWith(v, ','));
  };

  const valueListItemClassName =
    suppressStandardClassnames || !classNamesProp?.valueListItem
      ? standardClassnames.valueListItem
      : `${standardClassnames.valueListItem} ${classNamesProp.valueListItem}`.trim();

  const inputTypeCoerced = computed(() => {
    const it = toValue(inputType);
    const op = toValue(operator);
    return (it === 'bigint' || op === 'in' || op === 'notIn' ? 'text' : it || 'text') as InputType | 'text';
  });

  return {
    valueAsArray,
    multiValueHandler,
    parseNumberMethod,
    valueListItemClassName,
    inputTypeCoerced,
  };
}
