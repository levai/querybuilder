import { pathsAreEqual } from '@react-querybuilder/core';
import type { Path } from '@react-querybuilder/core';
import { computed, type ComputedRef } from 'vue';

export interface PathInfo {
  path: Path;
  disabled: boolean;
}

export interface UsePathsMemoInput {
  disabled: boolean;
  path: Path;
  nestedArray: unknown[];
  disabledPaths: Path[];
}

/**
 * 路径记忆化：为规则组内每项计算 path 与 disabled，避免每轮渲染重新分配数组。
 * 与 plan 5.4 / 阶段六 usePathsMemo 对齐。
 */
export function usePathsMemo(
  getInput: () => UsePathsMemoInput
): ComputedRef<PathInfo[]> {
  return computed(() => {
    const { disabled, path, nestedArray, disabledPaths } = getInput();
    const paths: PathInfo[] = [];
    for (let i = 0; i < nestedArray.length; i++) {
      const thisPath = [...path, i];
      paths[i] = {
        path: thisPath,
        disabled: disabled || disabledPaths.some((p) => pathsAreEqual(thisPath, p)),
      };
    }
    return paths;
  });
}
