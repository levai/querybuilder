import { ref, watch, type Ref } from 'vue';

/**
 * Returns a ref that always contains the previous value.
 * Adapted from React's usePrevious hook.
 *
 * @param value - The current value
 * @returns A ref containing the previous value
 *
 * @group Composables
 */
export function usePrevious<T>(value: T): Ref<T | undefined> {
  const previous = ref<T | undefined>(undefined);
  const current = ref(value);

  watch(
    () => value,
    (newValue) => {
      previous.value = current.value;
      current.value = newValue;
    },
    { immediate: true }
  );

  return previous;
}
