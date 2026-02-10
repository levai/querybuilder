/**
 * Vue 3 QueryBuilder utility functions
 */
import type { FullOption, FullOptionList, OptionList } from '@react-querybuilder/core';
import { isOptionGroupArray } from '@react-querybuilder/core';

/**
 * Converts an option list (flat or grouped) into option data for rendering.
 * Returns null if the list is empty or undefined.
 * This is the Vue equivalent of React's `toOptions()` utility.
 */
export function toOptions(arr?: OptionList): Array<{ type: 'option' | 'optgroup'; value?: string; label: string; disabled?: boolean; options?: Array<{ value: string; label: string; disabled?: boolean }> }> | null {
  if (isOptionGroupArray(arr)) {
    return arr.map(og => ({
      type: 'optgroup' as const,
      label: og.label,
      options: og.options.map(opt => ({
        value: opt.name,
        label: opt.label,
        disabled: opt.disabled,
      })),
    }));
  }

  if (Array.isArray(arr)) {
    return arr.map(opt => ({
      type: 'option' as const,
      value: opt.name,
      label: opt.label,
      disabled: opt.disabled,
    }));
  }

  return null;
}

/**
 * Generate a unique ID. Uses crypto.randomUUID if available, falls back to Math.random.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
