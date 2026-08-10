// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { scrollClass, setIntersection, setLazyload, shyel, stickyel } from '../src/index';

/**
 * A bundler that pre-renders on the server imports this package in a runtime
 * with no DOM globals at all. Importing it must not throw, and the guarded
 * entry points must degrade quietly rather than crash the render — a
 * ReferenceError here takes down the whole page, not just the effect.
 */
describe('in a runtime with no DOM', () => {
  it('imports without touching a DOM global', () => {
    expect(typeof scrollClass).toBe('function');
  });

  it('scrollClass returns a teardown instead of throwing', () => {
    expect(typeof scrollClass(null, [])).toBe('function');
  });

  it('shyel returns a teardown instead of throwing', () => {
    expect(typeof shyel(null)).toBe('function');
  });

  it('stickyel returns a teardown instead of throwing', () => {
    expect(typeof stickyel(null)).toBe('function');
  });

  it('setIntersection reports that it could not observe anything', () => {
    expect(setIntersection(null)).toBe(false);
  });

  it('setLazyload does nothing', () => {
    expect(() => setLazyload(null)).not.toThrow();
  });
});
