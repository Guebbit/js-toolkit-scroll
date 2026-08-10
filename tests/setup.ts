import { beforeEach } from 'vitest';

/**
 * jsdom implements neither `matchMedia` nor `HTMLMediaElement.load`, and the
 * library calls both unguarded, so every lazy-video test would die on "Not
 * implemented". Suites override these defaults when the answer matters.
 *
 * The assignment is unconditional: unstubbing leaves the key in place holding
 * undefined, so a presence check would skip the restore.
 */
beforeEach(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });

  if (typeof HTMLMediaElement !== 'undefined')
    HTMLMediaElement.prototype.load = function load() {
      return undefined;
    };
});
