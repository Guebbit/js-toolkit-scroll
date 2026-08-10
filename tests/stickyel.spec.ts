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
   * The element has to pin on the scroll event itself, not one throttle window
   * later. A deferred first response shows up as the header visibly lagging
   * behind the page before it snaps into place.
   */
  it('pins on the first scroll event, without waiting for the throttle window', () => {
    const element = elementAt(150);
    stickyel(element);

    scrollTo(200);

    expect(element.classList.contains('stickyel-active')).toBe(true);
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
