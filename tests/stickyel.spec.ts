import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stickyel } from '../src/index';
import { listenerCounter, mount, scrollTo, setRectTop } from './helpers/dom';

/** Past the throttle window, so the handler has run for the last value. */
const scrollAndSettle = (y: number) => {
  scrollTo(y);
  vi.advanceTimersByTime(200);
};

/** An element sitting `top` pixels down the page, since jsdom reports every box as zero. */
const elementAt = (top: number) => {
  const element = mount('<div></div>');
  setRectTop(element, top);
  return element;
};

describe('stickyel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    scrollTo(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing and attaches no listener without an element', () => {
    const count = listenerCounter(globalThis.window, 'scroll');

    const teardown = stickyel(null);

    expect(count()).toBe(0);
    expect(() => teardown()).not.toThrow();
  });

  it('leaves the element alone above its resting position', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollAndSettle(100);

    expect(element.classList.contains('stickyel-active')).toBe(false);
    expect(element.style.position).toBe('');
  });

  it('pins the element once the page reaches it', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollAndSettle(200);

    expect(element.classList.contains('stickyel-active')).toBe(true);
    expect(element.style.position).toBe('fixed');
    expect(element.style.top).toBe('0px');
  });

  /**
   * The boundary is inclusive: at exactly its resting offset the element is
   * touching the top edge, which is the moment it has to take over.
   */
  it('pins the element exactly at its resting offset', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollAndSettle(150);

    expect(element.classList.contains('stickyel-active')).toBe(true);
  });

  /**
   * Releasing has to restore the element to having no inline layout at all.
   * Leaving position or top behind pins it in the wrong place once the page
   * scrolls back up.
   */
  it('releases the element and removes its inline layout on the way back up', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollAndSettle(300);
    expect(element.style.position).toBe('fixed');

    scrollAndSettle(50);
    expect(element.classList.contains('stickyel-active')).toBe(false);
    expect(element.style.position).toBe('');
    expect(element.style.top).toBe('');
  });

  it('honours a custom class name', () => {
    const element = elementAt(100);
    stickyel(element, 'pinned');

    scrollAndSettle(200);
    expect(element.classList.contains('pinned')).toBe(true);

    scrollAndSettle(0);
    expect(element.classList.contains('pinned')).toBe(false);
  });

  it('measures the resting position from the page, not the viewport', () => {
    scrollTo(400);
    const element = elementAt(100);
    stickyel(element);

    // resting position is 400 + 100; still above it here
    scrollAndSettle(450);
    expect(element.classList.contains('stickyel-active')).toBe(false);

    scrollAndSettle(550);
    expect(element.classList.contains('stickyel-active')).toBe(true);
  });

  /**
   * The class and the inline position are two halves of one state. If they can
   * drift apart, CSS that keys on the class styles an element that is not
   * actually pinned.
   */
  it('keeps the class and the pinned layout in step across a scroll sequence', () => {
    const element = elementAt(150);
    stickyel(element);

    for (const y of [0, 200, 210, 149, 150, 900, 20, 1000, 0]) {
      scrollAndSettle(y);
      expect(element.classList.contains('stickyel-active')).toBe(element.style.position === 'fixed');
    }
  });

  it('settles to the same state when the same position is reached twice', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollAndSettle(300);
    const pinned = element.outerHTML;

    scrollAndSettle(300);
    expect(element.outerHTML).toBe(pinned);
  });

  /**
   * Regression, from a fast-check counterexample (restingTop 1, scroll 3159):
   * an element resting one pixel down the page must pin under a long scroll.
   * The generated case only failed because the resting offset had been measured
   * against a stale scroll position, which is precisely the mistake this pins.
   */
  it('pins an element resting near the very top under a long scroll', () => {
    const element = elementAt(1);
    stickyel(element);

    scrollAndSettle(3159);

    expect(element.classList.contains('stickyel-active')).toBe(true);
    expect(element.style.position).toBe('fixed');
  });

  /**
   * The work happens on the frame boundary, immediately before the paint that
   * shows it — not on a timer that can land mid-frame and force the browser to
   * redo layout it had already settled.
   */
  it('pins on the next frame, not on a timer', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollTo(200);
    expect(element.classList.contains('stickyel-active')).toBe(false);

    vi.advanceTimersToNextFrame();
    expect(element.classList.contains('stickyel-active')).toBe(true);
  });

  /**
   * Anything that reflows the page moves the resting position: a rotated
   * phone, a banner that collapses, a webfont that finished loading. Measuring
   * only once leaves the element pinning at a position that no longer exists.
   */
  it('re-measures its resting position when the page reflows', () => {
    const element = elementAt(500);
    stickyel(element);

    setRectTop(element, 200);
    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    scrollAndSettle(300);

    expect(element.classList.contains('stickyel-active')).toBe(true);
  });

  /**
   * The measurement has to be taken while the element is in the document flow.
   * Reading it while pinned returns the position it was moved to, not the one
   * it came from, and the element would then never release.
   */
  it('re-measures correctly while already pinned', () => {
    const element = elementAt(100);
    stickyel(element);
    scrollAndSettle(300);
    expect(element.classList.contains('stickyel-active')).toBe(true);

    // the element now rests far below the current scroll position
    setRectTop(element, 900);
    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    expect(element.classList.contains('stickyel-active')).toBe(false);
    expect(element.style.position).toBe('');
  });

  /**
   * Removing the listener is not enough on its own: a run already queued for
   * the next frame still holds a reference to the element and would touch it
   * after the caller has finished with it.
   */
  it('drops a queued run on teardown', () => {
    const element = elementAt(150);
    const teardown = stickyel(element);

    scrollTo(300);   // queues a run for the next frame
    teardown();
    vi.advanceTimersByTime(50);

    expect(element.classList.contains('stickyel-active')).toBe(false);
    expect(element.style.position).toBe('');
  });

  /**
   * The default is one run per frame, but the caller owns the trade-off between
   * responsiveness and work done, so they can substitute their own strategy.
   */
  it('uses a caller-supplied wrapper instead of the default', () => {
    const element = elementAt(150);
    const calls: (() => void)[] = [];
    stickyel(element, 'stickyel-active', { wrap: (handler) => { calls.push(handler); return handler; } });

    // the wrapper here is the identity function, so the handler runs synchronously
    scrollTo(200);

    expect(calls.length).toBeGreaterThan(0);
    expect(element.classList.contains('stickyel-active')).toBe(true);
  });

  /**
   * The resize listener is a second subscription and leaks just as easily as the
   * scroll one.
   */
  it('removes the resize listener on teardown', () => {
    const element = elementAt(150);
    const count = listenerCounter(globalThis.window, 'resize');
    const teardown = stickyel(element);

    expect(count()).toBe(1);
    teardown();
    expect(count()).toBe(0);
  });

  /**
   * A wrapper only has to be callable. Requiring a `cancel` on it would rule out
   * every plain function, including the identity wrapper that means "no rate
   * limiting at all".
   */
  it('tears down cleanly when the wrapper offers no cancel', () => {
    const element = elementAt(150);
    const teardown = stickyel(element, 'stickyel-active', { wrap: (handler) => handler });

    expect(() => teardown()).not.toThrow();
  });

  it('falls back to the global window for an element from a windowless document', () => {
    const foreign = document.implementation.createHTMLDocument();
    const element = foreign.createElement('div');

    expect(() => stickyel(element)).not.toThrow();
  });

  it('stops responding after teardown', () => {
    const element = elementAt(150);
    const count = listenerCounter(globalThis.window, 'scroll');
    const teardown = stickyel(element);

    expect(count()).toBe(1);
    teardown();
    expect(count()).toBe(0);

    scrollAndSettle(500);
    expect(element.classList.contains('stickyel-active')).toBe(false);
  });
});
