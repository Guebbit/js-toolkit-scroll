import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type IScrollClassSettings, scrollClass } from '../src/index';
import { listenerCounter, mount, scrollTo } from './helpers/dom';

/** Past the throttle window, so the handler has certainly run for the last value. */
const settle = () => vi.advanceTimersByTime(200);

/** Move the page and let the throttled handler catch up. */
const scrollAndSettle = (y: number) => {
  scrollTo(y);
  settle();
};

describe('scrollClass', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    scrollTo(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds the class once the threshold is passed', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'stuck', scroll: 200 }]);

    scrollAndSettle(201);

    expect(element.classList.contains('stuck')).toBe(true);
  });

  it('keeps the class off below the threshold', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'stuck', scroll: 200 }]);

    scrollAndSettle(199);

    expect(element.classList.contains('stuck')).toBe(false);
  });

  /**
   * The boundary is exclusive. An inclusive comparison would fire a frame early
   * and, for `scroll: 0`, would mark the page as scrolled while it sits at top.
   */
  it('treats the threshold itself as not yet passed', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'stuck', scroll: 200 }]);

    scrollAndSettle(200);

    expect(element.classList.contains('stuck')).toBe(false);
  });

  it('removes the class again when scrolling back above the threshold', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'stuck', scroll: 200 }]);

    scrollAndSettle(400);
    expect(element.classList.contains('stuck')).toBe(true);

    scrollAndSettle(100);
    expect(element.classList.contains('stuck')).toBe(false);
  });

  /**
   * `remove: true` is the mirror image: the class starts on the element in the
   * markup and is stripped past the threshold.
   */
  it('inverts the rule when remove is set', () => {
    const element = mount('<div class="hero"></div>');
    scrollClass(element, [{ class: 'hero', scroll: 200, remove: true }]);

    scrollAndSettle(100);
    expect(element.classList.contains('hero')).toBe(true);

    scrollAndSettle(300);
    expect(element.classList.contains('hero')).toBe(false);
  });

  it('defaults the threshold to zero', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'scrolled' } as never]);

    scrollAndSettle(1);

    expect(element.classList.contains('scrolled')).toBe(true);
  });

  it('applies every instruction independently', () => {
    const element = mount('<div></div>');
    scrollClass(element, [
      { class: 'a', scroll: 100 },
      { class: 'b', scroll: 300 },
    ]);

    scrollAndSettle(200);

    expect(element.classList.contains('a')).toBe(true);
    expect(element.classList.contains('b')).toBe(false);
  });

  it('applies every instruction to every element', () => {
    const first = mount('<div></div>');
    const second = mount('<div></div>');
    scrollClass([first, second], [{ class: 'on', scroll: 10 }]);

    scrollAndSettle(50);

    expect(first.classList.contains('on')).toBe(true);
    expect(second.classList.contains('on')).toBe(true);
  });

  it('accepts a NodeList', () => {
    mount('<div class="target"></div>');
    mount('<div class="target"></div>');
    scrollClass(document.querySelectorAll('.target'), [{ class: 'on', scroll: 10 }]);

    scrollAndSettle(50);

    for (const element of document.querySelectorAll('.target'))
      expect(element.classList.contains('on')).toBe(true);
  });

  /**
   * The signature advertises HTMLCollection, which is what
   * getElementsByClassName and `.children` return. Unlike NodeList it is not
   * array-like enough for a plain spread of the caller's helper, so it needs
   * its own normalisation or the call throws before attaching any listener.
   */
  it('accepts an HTMLCollection', () => {
    const parent = mount('<div><span></span><span></span></div>');
    scrollClass(parent.children, [{ class: 'on', scroll: 10 }]);

    scrollAndSettle(50);

    for (const child of parent.children) expect(child.classList.contains('on')).toBe(true);
  });

  it('does nothing and attaches no listener when there is no element', () => {
    const count = listenerCounter(globalThis.window, 'scroll');

    const teardown = scrollClass(null, [{ class: 'on', scroll: 0 }]);

    expect(count()).toBe(0);
    expect(() => teardown()).not.toThrow();
  });

  it('leaves the element untouched until the first scroll event', () => {
    const element = mount('<div></div>');
    scrollClass(element, [{ class: 'on', scroll: 0 }]);

    expect(element.className).toBe('');
  });

  /**
   * The returned teardown is the only handle a caller has on the listener.
   * If it fails to detach, a single-page app leaks one handler per navigation
   * and keeps mutating elements that are no longer on the page.
   */
  it('stops responding after teardown', () => {
    const element = mount('<div></div>');
    const count = listenerCounter(globalThis.window, 'scroll');
    const teardown = scrollClass(element, [{ class: 'on', scroll: 100 }]);

    expect(count()).toBe(1);
    teardown();
    expect(count()).toBe(0);

    scrollAndSettle(500);
    expect(element.classList.contains('on')).toBe(false);
  });

  /**
   * The remove branch has its own comparison, so it needs its own boundary
   * case: at exactly the threshold the class is still on the element.
   */
  it('treats the threshold as not yet passed on the remove branch too', () => {
    const element = mount('<div class="hero"></div>');
    scrollClass(element, [{ class: 'hero', scroll: 200, remove: true }]);

    scrollAndSettle(200);

    expect(element.classList.contains('hero')).toBe(true);
  });

  /**
   * Callers hand-build these arrays. One hole must not take down the handler,
   * which runs on every scroll event for the life of the page.
   */
  it('skips holes in the element list', () => {
    const element = mount('<div></div>');
    scrollClass([element, null as unknown as HTMLElement], [{ class: 'on', scroll: 10 }]);

    scrollAndSettle(50);

    expect(element.classList.contains('on')).toBe(true);
  });

  it('skips holes in the instruction list', () => {
    const element = mount('<div></div>');
    scrollClass(element, [
      { class: 'on', scroll: 10 },
      null as unknown as IScrollClassSettings,
    ]);

    scrollAndSettle(50);

    expect(element.classList.contains('on')).toBe(true);
  });

  /**
   * The window is taken from the element's own document, not the global one,
   * so the library works inside an iframe. A document with no window at all
   * still has to fall back rather than crash.
   */
  it('falls back to the global window for an element from a windowless document', () => {
    const foreign = document.implementation.createHTMLDocument();
    const element = foreign.createElement('div');

    expect(() => scrollClass(element, [{ class: 'on', scroll: 10 }])).not.toThrow();
  });

  it('preserves classes it was not asked about', () => {
    const element = mount('<div class="keep"></div>');
    scrollClass(element, [{ class: 'on', scroll: 100 }]);

    scrollAndSettle(500);

    expect(element.classList.contains('keep')).toBe(true);
  });
});
