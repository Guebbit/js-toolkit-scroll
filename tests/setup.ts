import { beforeEach } from 'vitest';

/**
 * jsdom implements neither `matchMedia` nor `HTMLMediaElement.load`, and the
 * library calls both unguarded. Without these two defaults every lazy-video
 * test dies on "Not implemented" before it can assert anything, so the default
 * lives here and individual suites override it when the answer matters.
 *
 * The assignment is unconditional: unstubbing a suite's own matchMedia leaves
 * the key in place holding undefined, so a presence check would decline to
 * restore the default and the next suite would call undefined.
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
