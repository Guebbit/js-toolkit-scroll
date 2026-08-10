import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { shyel } from '../src/index';
import { listenerCounter, mount, scrollTo, setOffsetHeight } from './helpers/dom';

/** Past the throttle window, so the handler has run for the last value. */
const scrollAndSettle = (y: number) => {
  scrollTo(y);
  vi.advanceTimersByTime(200);
};

/** A header of a known height, since jsdom reports every box as zero. */
const header = (height = 60) => {
  const element = mount('<header></header>');
  setOffsetHeight(element, height);
  return element;
};

describe('shyel', () => {
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

    const teardown = shyel(null);

    expect(count()).toBe(0);
    expect(() => teardown()).not.toThrow();
  });

  /**
   * The first few pixels of a scroll are where momentum scrolling and address
   * bar resizing produce phantom movement. Hiding a header there makes it
   * flicker on every touch, so the top of the page is left alone entirely.
   */
  it('ignores movement in the first 10px', () => {
    const element = header();
    shyel(element);

    scrollAndSettle(9);

    expect(element.className).toBe('');
    expect(element.style.top).toBe('');
  });

  it('shows the element below the threshold', () => {
    const element = header();
    shyel(element, 200);

    scrollAndSettle(100);

    expect(element.classList.contains('shyel-show')).toBe(true);
    expect(element.classList.contains('shyel-hide')).toBe(false);
  });

  it('hides the element when scrolling down past the threshold', () => {
    const element = header();
    shyel(element, 200);

    scrollAndSettle(300);

    expect(element.classList.contains('shyel-hide')).toBe(true);
    expect(element.classList.contains('shyel-show')).toBe(false);
  });

  /**
   * The element is pulled up by its own height plus a pixel, so no sliver of it
   * is left visible against the top edge.
   */
  it('lifts the element by its own height when hiding', () => {
    const element = header(60);
    shyel(element, 200);

    scrollAndSettle(300);

    expect(element.style.top).toBe('-61px');
  });

  it('brings the element back when scrolling up', () => {
    const element = header();
    shyel(element, 100);

    scrollAndSettle(500);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    scrollAndSettle(300);
    expect(element.classList.contains('shyel-show')).toBe(true);
    expect(element.classList.contains('shyel-hide')).toBe(false);
    expect(element.style.top).toBe('');
  });

  it('clears the offset when dropping back below the threshold', () => {
    const element = header();
    shyel(element, 200);

    scrollAndSettle(400);
    expect(element.style.top).toBe('-61px');

    scrollAndSettle(50);
    expect(element.style.top).toBe('');
  });

  /**
   * Intensity is the guard against a jittery trackpad flipping the header on
   * every frame: a movement smaller than it must leave the state exactly as it
   * was, in either direction.
   */
  it('ignores movements smaller than the configured intensity', () => {
    const element = header();
    shyel(element, 0, { intensity: 100 });

    scrollAndSettle(200);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    scrollAndSettle(250);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    scrollAndSettle(160);
    expect(element.classList.contains('shyel-hide')).toBe(true);
  });

  it('acts once the movement reaches the intensity', () => {
    const element = header();
    shyel(element, 0, { intensity: 100 });

    scrollAndSettle(300);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    scrollAndSettle(200);
    expect(element.classList.contains('shyel-show')).toBe(true);
  });

  it('honours custom class names', () => {
    const element = header();
    shyel(element, 100, { classShow: 'up', classHide: 'down' });

    scrollAndSettle(500);
    expect(element.classList.contains('down')).toBe(true);

    scrollAndSettle(200);
    expect(element.classList.contains('up')).toBe(true);
  });

  it('uses an explicit elementHeight over the measured one', () => {
    const element = header(60);
    shyel(element, 100, { elementHeight: 500 });

    scrollAndSettle(300);

    expect(element.style.top).toBe('-500px');
  });

  /**
   * elementHeight 0 is the "classes only" mode, for a header animated entirely
   * in CSS. Writing an inline top would fight that animation.
   */
  it('never touches the inline top when elementHeight is 0', () => {
    const element = header();
    shyel(element, 100, { elementHeight: 0 });

    scrollAndSettle(500);
    expect(element.classList.contains('shyel-hide')).toBe(true);
    expect(element.style.top).toBe('');

    scrollAndSettle(200);
    expect(element.style.top).toBe('');
  });

  /**
   * The two classes are opposites. Both at once means whichever CSS rule wins
   * the cascade decides, which is a coin flip the caller cannot control.
   */
  it('never leaves both classes on the element at once', () => {
    const element = header();
    shyel(element, 100, { intensity: 20 });

    for (const y of [50, 400, 420, 300, 900, 15, 1000]) {
      scrollAndSettle(y);
      expect(element.classList.contains('shyel-show') && element.classList.contains('shyel-hide')).toBe(
        false
      );
    }
  });

  /**
   * At exactly the threshold the header is not yet "past" it, so the direction
   * logic takes over rather than the unconditional show branch.
   */
  it('leaves the threshold itself to the direction logic', () => {
    const element = header();
    shyel(element, 200);

    scrollAndSettle(200);

    expect(element.classList.contains('shyel-hide')).toBe(true);
  });

  /**
   * A scroll event that reports the same position is not a change of direction.
   * Treating it as upward movement would pop the header back into view while
   * the page is standing still.
   */
  it('stays hidden when the same position is reported again', () => {
    const element = header();
    shyel(element, 100);

    scrollAndSettle(400);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    scrollAndSettle(400);
    expect(element.classList.contains('shyel-hide')).toBe(true);
  });

  it('falls back to the global window for an element from a windowless document', () => {
    const foreign = document.implementation.createHTMLDocument();
    const element = foreign.createElement('header');

    expect(() => shyel(element, 100)).not.toThrow();
  });

  it('stops responding after teardown', () => {
    const element = header();
    const count = listenerCounter(globalThis.window, 'scroll');
    const teardown = shyel(element, 100);

    expect(count()).toBe(1);
    teardown();
    expect(count()).toBe(0);

    scrollAndSettle(500);
    expect(element.className).toBe('');
  });
});
