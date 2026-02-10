import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { watch, ref, type Ref } from 'vue';
import { messages } from '../messages';

export interface UseControlledOrUncontrolledParams {
  defaultQuery?: Ref<RuleGroupTypeAny | undefined> | RuleGroupTypeAny;
  modelValue?: Ref<RuleGroupTypeAny | undefined> | RuleGroupTypeAny;
}

function unwrap<T>(v: Ref<T> | T): T {
  return typeof v === 'object' && v !== null && 'value' in v ? (v as Ref<T>).value : (v as T);
}

/**
 * 受控/非受控模式警告：当同时提供 modelValue 与 defaultQuery、或从受控切到非受控（及反向）时在开发环境打 console.error。
 * 与 React useControlledOrUncontrolled 行为对齐。
 */
export function useControlledOrUncontrolled(params: UseControlledOrUncontrolledParams): void {
  const prevQueryPresent = ref<boolean | null>(null);

  watch(
    () => unwrap(params.modelValue) != null,
    (hasModel) => {
      if (typeof process !== 'undefined' && (process as NodeJS.Process).env?.NODE_ENV !== 'production') {
        const hasDefault = unwrap(params.defaultQuery) != null;

        if (hasModel && hasDefault) {
          console.error(messages.errorBothQueryDefaultQuery);
        }
        if (prevQueryPresent.value === false && hasModel && !hasDefault) {
          console.error(messages.errorUncontrolledToControlled);
        }
        if (prevQueryPresent.value === true && !hasModel && hasDefault) {
          console.error(messages.errorControlledToUncontrolled);
        }

        prevQueryPresent.value = hasModel;
      }
    },
    { immediate: true }
  );
}
