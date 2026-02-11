import { pathsAreEqual, type Path } from '@react-querybuilder/core';
import { computed, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';

export interface PathInfo {
  path: Path;
  disabled: boolean;
}

/**
 * Memoized path list with disabled flags (group disabled or path in disabledPaths).
 * @group Composables
 */
export function usePathsMemo(options: {
  disabled: MaybeRefOrGetter<boolean>;
  path: MaybeRefOrGetter<Path>;
  nestedArray: MaybeRefOrGetter<unknown[]>;
  disabledPaths: MaybeRefOrGetter<Path[]>;
}): ComputedRef<PathInfo[]> {
  return computed(() => {
    const disabled = toValue(options.disabled);
    const path = toValue(options.path);
    const nestedArray = toValue(options.nestedArray);
    const disabledPaths = toValue(options.disabledPaths);
    const len = nestedArray.length;
    const paths: PathInfo[] = [];
    for (let i = 0; i < len; i++) {
      const thisPath = [...path, i];
      paths.push({
        path: thisPath,
        disabled: disabled || disabledPaths.some(p => pathsAreEqual(thisPath, p)),
      });
    }
    return paths;
  });
}
