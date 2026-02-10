import { computed } from 'vue';

interface RQBMouseEventHandler {
  // oxlint-disable-next-line typescript/no-explicit-any
  (event?: MouseEvent, context?: any): void;
}

/**
 * Wraps an event handler function in another function that calls
 * `event.preventDefault()` and `event.stopPropagation()` first. The
 * returned function accepts and forwards a second `context` argument.
 *
 * @group Composables
 */
export const useStopEventPropagation = (
  method: RQBMouseEventHandler
): RQBMouseEventHandler => {
  return computed(() => (event?: MouseEvent, context?: any) => {
    event?.preventDefault();
    event?.stopPropagation();
    method(event, context);
  }).value;
};
