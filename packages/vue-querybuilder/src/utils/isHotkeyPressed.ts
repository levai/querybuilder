/**
 * Tracks currently pressed keys for modifier detection (copy/group in DnD).
 * Ported from @react-querybuilder/dnd isHotkeyPressed.
 */
import { lc } from '@react-querybuilder/core';

type ModifierKey = 'shift' | 'alt' | 'meta' | 'mod' | 'ctrl';

const reservedModifierKeywords = new Set<ModifierKey>(['shift', 'alt', 'meta', 'mod', 'ctrl']);

const mappedKeys: Record<string, string> = {
  esc: 'escape',
  return: 'enter',
  '.': 'period',
  ',': 'comma',
  '-': 'slash',
  ' ': 'space',
  '`': 'backquote',
  '#': 'backslash',
  '+': 'bracketright',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  AltLeft: 'alt',
  AltRight: 'alt',
  MetaLeft: 'meta',
  MetaRight: 'meta',
  OSLeft: 'meta',
  OSRight: 'meta',
  ControlLeft: 'ctrl',
  ControlRight: 'ctrl',
};

const mapKey = (key?: string) =>
  lc(((key && mappedKeys[key]) || key || '').trim()).replace(/key|digit|numpad|arrow/, '');

const isHotkeyModifier = (key: string) => reservedModifierKeywords.has(key as ModifierKey);

const keyAliases: Record<string, string> = {
  '⌘': 'meta',
  cmd: 'meta',
  command: 'meta',
  '⊞': 'meta',
  win: 'meta',
  windows: 'meta',
  '⇧': 'shift',
  '⌥': 'alt',
  '⌃': 'ctrl',
  control: 'ctrl',
};

const currentlyPressedKeys: Set<string> = new Set<string>();

function pushToCurrentlyPressedKeys(keys: string | string[]) {
  const arr = Array.isArray(keys) ? keys : [keys];
  if (currentlyPressedKeys.has('meta')) {
    for (const k of currentlyPressedKeys) {
      if (!isHotkeyModifier(k)) currentlyPressedKeys.delete(lc(k));
    }
  }
  for (const k of arr) currentlyPressedKeys.add(lc(k));
}

function removeFromCurrentlyPressedKeys(keys: string | string[]) {
  const arr = Array.isArray(keys) ? keys : [keys];
  if (keys === 'meta') {
    currentlyPressedKeys.clear();
  } else {
    for (const k of arr) currentlyPressedKeys.delete(lc(k));
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === undefined) return;
    pushToCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
  });
  document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === undefined) return;
    removeFromCurrentlyPressedKeys([mapKey(e.key), mapKey(e.code)]);
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('blur', () => currentlyPressedKeys.clear());
}

const isReadonlyArray = (v: unknown): v is readonly unknown[] => Array.isArray(v);

export function isHotkeyPressed(key: string | readonly string[], splitKey = ','): boolean {
  const keys = isReadonlyArray(key) ? key : key.split(splitKey);
  return keys.every(hk => currentlyPressedKeys.has(keyAliases[lc(String(hk).trim())] ?? lc(String(hk).trim())));
}
