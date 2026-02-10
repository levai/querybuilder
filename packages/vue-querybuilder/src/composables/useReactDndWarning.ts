import { messages } from '../messages';

let didWarnEnabledDndWithoutVueDnD = false;

/**
 * Logs a warning if drag-and-drop is enabled but the required dependencies
 * (@vue-dnd-kit/core) were not detected.
 *
 * @group Composables
 */
export const useReactDndWarning = (enableDragAndDrop: boolean, dndRefs: boolean): void => {
  if (
    process.env.NODE_ENV !== 'production' &&
    !didWarnEnabledDndWithoutVueDnD &&
    enableDragAndDrop &&
    !dndRefs
  ) {
    console.error(messages.errorEnabledDndWithoutReactDnD);
    didWarnEnabledDndWithoutVueDnD = true;
  }
};
