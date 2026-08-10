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

  /**
   * A header that shrinks on scroll, or a viewport that rotates, changes how far
   * the element has to travel. Measuring only once leaves it hiding by the wrong
   * amount for the rest of the page's life.
   */
  it('re-measures its travel when the element changes height', () => {
    const element = header(60);
    shyel(element, 100);

    scrollAndSettle(400);
    expect(element.style.top).toBe('-61px');

    setOffsetHeight(element, 100);
    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    expect(element.style.top).toBe('-101px');
  });

  it('uses the new travel for later hides too', () => {
    const element = header(60);
    shyel(element, 100);

    setOffsetHeight(element, 200);
    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    scrollAndSettle(400);

    expect(element.style.top).toBe('-201px');
  });

  /**
   * An explicit height is the caller's number, not a measurement, so a reflow
   * must not overwrite it.
   */
  it('leaves an explicit elementHeight alone on reflow', () => {
    const element = header(60);
    shyel(element, 100, { elementHeight: 500 });

    setOffsetHeight(element, 999);
    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);
    scrollAndSettle(400);

    expect(element.style.top).toBe('-500px');
  });

  /**
   * Removing the listener is not enough: a run already queued for the next
   * frame still touches an element the caller has finished with.
   */
  it('drops a queued run on teardown', () => {
    const element = header();
    const teardown = shyel(element, 100);

    scrollTo(500);   // queues a run for the next frame
    teardown();
    vi.advanceTimersByTime(50);

    expect(element.className).toBe('');
  });

  it('uses a caller-supplied wrapper instead of the default', () => {
    const element = header();
    shyel(element, 100, { wrap: (handler) => handler });

    // an identity wrapper runs the handler on the event itself
    scrollTo(500);

    expect(element.classList.contains('shyel-hide')).toBe(true);
  });

  it('removes the resize listener on teardown', () => {
    const element = header();
    const count = listenerCounter(globalThis.window, 'resize');
    const teardown = shyel(element, 100);

    expect(count()).toBe(1);
    teardown();
    expect(count()).toBe(0);
  });

  it('tears down cleanly when the wrapper offers no cancel', () => {
    const element = header();
    const teardown = shyel(element, 100, { wrap: (handler) => handler });

    expect(() => teardown()).not.toThrow();
  });

  /**
   * Re-measuring must not start writing offsets the caller opted out of.
   */
  it('writes no offset on resize when elementHeight is 0', () => {
    const element = header();
    shyel(element, 100, { elementHeight: 0 });
    scrollAndSettle(500);
    expect(element.classList.contains('shyel-hide')).toBe(true);

    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    expect(element.style.top).toBe('');
  });

  /**
   * Only a hidden header is sitting at an offset. Re-applying one to a visible
   * header on every reflow would push it off screen.
   */
  it('leaves a visible header alone on resize', () => {
    const element = header(60);
    shyel(element, 100);

    scrollAndSettle(500);
    scrollAndSettle(200);
    expect(element.classList.contains('shyel-show')).toBe(true);

    globalThis.window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(50);

    expect(element.style.top).toBe('');
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
