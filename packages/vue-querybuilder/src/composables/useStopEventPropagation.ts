import type { Ref } from 'vue';

type MouseLikeEvent = { preventDefault?: () => void; stopPropagation?: () => void };
// Accept any click-like handler; wrapper receives DOM MouseEvent and forwards it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (event?: MouseLikeEvent | MouseEvent, context?: any) => void;

/**
 * Wraps a handler so it calls preventDefault and stopPropagation first.
 * @group Composables
 */
export function useStopEventPropagation<T = Handler>(method: T | Ref<T>): Handler {
  const fn = (typeof method === 'function' ? method : (method as Ref<T>).value) as Handler;
  return (event?: MouseLikeEvent | MouseEvent, context?: unknown) => {
    (event as MouseLikeEvent)?.preventDefault?.();
    (event as MouseLikeEvent)?.stopPropagation?.();
    fn?.(event, context);
  };
}
