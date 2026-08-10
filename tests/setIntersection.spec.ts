import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setIntersection } from '../src/index';
import {
  firstArgs,
  installIntersectionObserver,
  lastObserver,
  mount,
  withoutIntersectionObserver,
} from './helpers/dom';

/**
 * Let any deferred delivery run. The contract says nothing about *when* the
 * callbacks fire, so the tests flush timers and assert only on the outcome.
 */
const flush = () => vi.advanceTimersByTime(200);

describe('setIntersection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    installIntersectionObserver();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for a null target list', () => {
    expect(setIntersection(null)).toBe(false);
  });

  it('returns the observer it created', () => {
    const element = mount('<div></div>');

    const observer = setIntersection([element]);

    expect(observer).toBe(lastObserver());
  });

  it('observes every element exactly once', () => {
    const first = mount('<div></div>');
    const second = mount('<div></div>');

    setIntersection([first, second]);

    expect(lastObserver().observed).toHaveLength(2);
    expect(lastObserver().observed).toContain(first);
    expect(lastObserver().observed).toContain(second);
  });

  it('accepts a NodeList', () => {
    mount('<div class="t"></div>');
    mount('<div class="t"></div>');

    setIntersection(document.querySelectorAll('.t'));

    expect(lastObserver().observed).toHaveLength(2);
  });

  it('observes nothing for an empty list but still returns an observer', () => {
    const observer = setIntersection([]);

    expect(observer).not.toBe(false);
    expect(lastObserver().observed).toEqual([]);
  });

  /**
   * Handing a hole to observe() throws in a real browser and takes the rest of
   * the list down with it, so the whole page below stops being watched.
   */
  it('skips holes in the element list', () => {
    const element = mount('<div></div>');

    setIntersection([null as unknown as Element, element, undefined as unknown as Element]);

    expect(lastObserver().observed).toEqual([element]);
  });

  it('forwards root, rootMargin and threshold to the observer', () => {
    const root = mount('<div></div>');
    const element = mount('<div></div>');

    setIntersection([element], { root, rootMargin: '500px 0px', threshold: 0.5 });

    expect(lastObserver().root).toBe(root);
    expect(lastObserver().rootMargin).toBe('500px 0px');
    expect(lastObserver().thresholds).toEqual([0.5]);
  });

  /**
   * The defaults define "fires as soon as any pixel enters the viewport".
   * A non-zero default threshold would silently break every caller that relies
   * on the earliest possible trigger, lazyload above all.
   */
  it('defaults to the whole viewport and a zero threshold', () => {
    setIntersection([mount('<div></div>')]);

    expect(lastObserver().root).toBe(null);
    expect(lastObserver().rootMargin).toBe('0px');
    expect(lastObserver().thresholds).toEqual([0]);
  });

  it('calls intersectingCallback with the entering element', () => {
    const element = mount('<div></div>');
    const intersectingCallback = vi.fn();
    setIntersection([element], { intersectingCallback });

    lastObserver().emit([{ target: element, isIntersecting: true }]);
    flush();

    expect(firstArgs(intersectingCallback)).toEqual([element]);
  });

  it('calls notIntersectingCallback with the leaving element', () => {
    const element = mount('<div></div>');
    const notIntersectingCallback = vi.fn();
    setIntersection([element], { notIntersectingCallback });

    lastObserver().emit([{ target: element, isIntersecting: false }]);
    flush();

    expect(firstArgs(notIntersectingCallback)).toEqual([element]);
  });

  it('does not cross the two callbacks', () => {
    const element = mount('<div></div>');
    const intersectingCallback = vi.fn();
    const notIntersectingCallback = vi.fn();
    setIntersection([element], { intersectingCallback, notIntersectingCallback });

    lastObserver().emit([{ target: element, isIntersecting: true }]);
    flush();

    expect(intersectingCallback).toHaveBeenCalledTimes(1);
    expect(notIntersectingCallback).not.toHaveBeenCalled();
  });

  it('handles a mixed batch of entering and leaving elements', () => {
    const entering = mount('<div></div>');
    const leaving = mount('<div></div>');
    const intersectingCallback = vi.fn();
    const notIntersectingCallback = vi.fn();
    setIntersection([entering, leaving], { intersectingCallback, notIntersectingCallback });

    lastObserver().emit([
      { target: entering, isIntersecting: true },
      { target: leaving, isIntersecting: false },
    ]);
    flush();

    expect(firstArgs(intersectingCallback)).toContain(entering);
    expect(firstArgs(notIntersectingCallback)).toContain(leaving);
  });

  /**
   * The browser is free to split one scroll into several callback invocations
   * that land microseconds apart. Every entry it hands over has to reach a
   * callback: coalescing the batches drops whichever elements were reported
   * first, which shows up as images that never load and sections that never
   * activate on a fast scroll.
   */
  it('reports every element across back-to-back batches', () => {
    const first = mount('<div></div>');
    const second = mount('<div></div>');
    const intersectingCallback = vi.fn();
    setIntersection([first, second], { intersectingCallback });

    lastObserver().emit([{ target: first, isIntersecting: true }]);
    lastObserver().emit([{ target: second, isIntersecting: true }]);
    flush();

    expect(firstArgs(intersectingCallback)).toContain(first);
    expect(firstArgs(intersectingCallback)).toContain(second);
  });

  it('stops observing an element after its first intersection when single is set', () => {
    const element = mount('<div></div>');
    setIntersection([element], { single: true, intersectingCallback: vi.fn() });

    lastObserver().emit([{ target: element, isIntersecting: true }]);
    flush();

    expect(lastObserver().unobserved).toContain(element);
  });

  /**
   * `single` describes the observation, not the callback. A caller that only
   * wants the side effect of unobserving must not be forced to pass a callback
   * it has no use for.
   */
  it('honours single even without an intersectingCallback', () => {
    const element = mount('<div></div>');
    setIntersection([element], { single: true });

    lastObserver().emit([{ target: element, isIntersecting: true }]);
    flush();

    expect(lastObserver().unobserved).toContain(element);
  });

  it('keeps observing by default', () => {
    const element = mount('<div></div>');
    setIntersection([element], { intersectingCallback: vi.fn() });

    lastObserver().emit([{ target: element, isIntersecting: true }]);
    flush();

    expect(lastObserver().unobserved).toEqual([]);
  });

  it('never unobserves on a leaving entry, even with single set', () => {
    const element = mount('<div></div>');
    setIntersection([element], { single: true, notIntersectingCallback: vi.fn() });

    lastObserver().emit([{ target: element, isIntersecting: false }]);
    flush();

    expect(lastObserver().unobserved).toEqual([]);
  });

  /**
   * Where IntersectionObserver is missing there is no way to know when an
   * element becomes visible, so the only safe reading is "everything is
   * visible" — otherwise a lazyloaded page renders permanently blank.
   */
  describe('without IntersectionObserver support', () => {
    it('activates every element immediately and returns false', () => {
      const first = mount('<div></div>');
      const second = mount('<div></div>');
      const intersectingCallback = vi.fn();

      const result = withoutIntersectionObserver(() =>
        setIntersection([first, second], { intersectingCallback })
      );

      expect(result).toBe(false);
      expect(firstArgs(intersectingCallback)).toContain(first);
      expect(firstArgs(intersectingCallback)).toContain(second);
      expect(intersectingCallback).toHaveBeenCalledTimes(2);
    });

    it('never calls notIntersectingCallback', () => {
      const notIntersectingCallback = vi.fn();

      withoutIntersectionObserver(() =>
        setIntersection([mount('<div></div>')], { notIntersectingCallback })
      );

      expect(notIntersectingCallback).not.toHaveBeenCalled();
    });

    it('does not throw when no callback is given', () => {
      expect(() =>
        withoutIntersectionObserver(() => setIntersection([mount('<div></div>')]))
      ).not.toThrow();
    });

    it('still returns false for a null target list', () => {
      expect(withoutIntersectionObserver(() => setIntersection(null))).toBe(false);
    });
  });
});
