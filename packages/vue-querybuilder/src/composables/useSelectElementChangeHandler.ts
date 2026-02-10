import { computed } from 'vue';

export interface UseSelectElementChangeHandlerParams {
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}

/**
 * Returns a memoized change handler for HTML `<select>` elements.
 *
 * @group Composables
 */
export const useSelectElementChangeHandler = (
  params: UseSelectElementChangeHandlerParams
): ((e: Event) => void) => {
  const { multiple, onChange } = params;
  
  return computed(() => {
    if (multiple) {
      return (e: Event) => {
        const target = e.target as HTMLSelectElement;
        onChange(Array.from(target.selectedOptions).map(o => o.value));
      };
    }
    return (e: Event) => {
      const target = e.target as HTMLSelectElement;
      onChange(target.value);
    };
  }).value;
};
