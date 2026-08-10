import { beforeEach, describe, expect, it } from 'vitest';

import { activateIntersection, activateIntersectionOnce } from '../src/index';
import {
  installIntersectionObserver,
  lastObserver,
  mount,
  stubMatchMedia,
  withoutIntersectionObserver,
} from './helpers/dom';

const enter = (element: Element) =>
  lastObserver().emit([{ target: element, isIntersecting: true }]);
const leave = (element: Element) =>
  lastObserver().emit([{ target: element, isIntersecting: false }]);

describe('activateIntersection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    installIntersectionObserver();
    stubMatchMedia(false);
  });

  it('picks up .observer-activate by default', () => {
    const element = mount('<div class="observer-activate"></div>');
    mount('<div class="unrelated"></div>');

    activateIntersection();

    expect(lastObserver().observed).toEqual([element]);
  });

  /**
   * The default threshold is 1: the whole element has to be on screen before it
   * animates in. A lower one triggers the animation while the element is still
   * half cut off by the viewport edge.
   */
  it('waits for the element to be fully visible by default', () => {
    activateIntersection([mount('<div></div>')]);

    expect(lastObserver().thresholds).toEqual([1]);
  });

  it('adds the active class on entry', () => {
    const element = mount('<div></div>');
    activateIntersection([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  it('removes the active class on exit', () => {
    const element = mount('<div></div>');
    activateIntersection([element]);

    enter(element);
    leave(element);

    expect(element.classList.contains('active')).toBe(false);
  });

  it('honours a custom active class', () => {
    const element = mount('<div></div>');
    activateIntersection([element], 'seen');

    enter(element);

    expect(element.classList.contains('seen')).toBe(true);
  });

  it('keeps observing so the element can activate again', () => {
    const element = mount('<div></div>');
    activateIntersection([element]);

    enter(element);
    leave(element);
    enter(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  /**
   * The mobile-only opt-out exists so a desktop layout is not left mid-animation
   * by an effect that was only ever designed for a narrow viewport.
   */
  it('skips a mobile-only element on a wide viewport', () => {
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersection([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(false);
  });

  it('activates a mobile-only element on a narrow viewport', () => {
    stubMatchMedia((query) => query.includes('max-width: 600px'));
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersection([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  it('leaves a mobile-only element that is already active alone on a wide viewport', () => {
    const element = mount('<div class="observer-mobile-only active"></div>');
    activateIntersection([element]);

    leave(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  /**
   * The exit path asks the same media question as the entry path. If it asked a
   * different one, a mobile-only element could be activated on a narrow
   * viewport and then never deactivated.
   */
  it('deactivates a mobile-only element on a narrow viewport', () => {
    stubMatchMedia((query) => query.includes('max-width: 600px'));
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersection([element]);

    enter(element);
    expect(element.classList.contains('active')).toBe(true);

    leave(element);
    expect(element.classList.contains('active')).toBe(false);
  });

  it('honours a custom mobile-only class', () => {
    const element = mount('<div class="only-small"></div>');
    activateIntersection([element], 'active', 'only-small');

    enter(element);

    expect(element.classList.contains('active')).toBe(false);
  });
});

describe('activateIntersectionOnce', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    installIntersectionObserver();
    stubMatchMedia(false);
  });

  /**
   * Where IntersectionObserver is missing, setIntersection activates every
   * element synchronously, from inside its own call. Anything the callback
   * reaches for has to already exist at that moment.
   */
  it('activates everything immediately where IntersectionObserver is missing', () => {
    const element = mount('<div></div>');

    expect(() =>
      withoutIntersectionObserver(() => activateIntersectionOnce([element]))
    ).not.toThrow();
    expect(element.classList.contains('active')).toBe(true);
  });

  it('picks up .observer-activate-once by default', () => {
    const element = mount('<div class="observer-activate-once"></div>');
    mount('<div class="observer-activate"></div>');

    activateIntersectionOnce();

    expect(lastObserver().observed).toEqual([element]);
  });

  it('adds the active class on entry', () => {
    const element = mount('<div></div>');
    activateIntersectionOnce([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  /**
   * "Once" means the effect is permanent. Removing the class on exit would make
   * a reveal animation replay every time the user scrolls past it.
   */
  it('keeps the active class when the element leaves', () => {
    const element = mount('<div></div>');
    activateIntersectionOnce([element]);

    enter(element);
    leave(element);

    expect(element.classList.contains('active')).toBe(true);
  });

  /**
   * The class is applied once and never removed, so there is nothing left for
   * the observer to report. Leaving it attached keeps every revealed section on
   * the page under observation for as long as the document lives.
   */
  it('stops observing an element once it has activated', () => {
    const element = mount('<div></div>');
    activateIntersectionOnce([element]);

    enter(element);

    expect(lastObserver().unobserved).toContain(element);
  });

  /**
   * A mobile-only element on a wide viewport has not been activated yet, so it
   * has to stay under observation — the viewport can still become narrow.
   */
  it('keeps observing a mobile-only element it declined to activate', () => {
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersectionOnce([element]);

    enter(element);

    expect(lastObserver().unobserved).toEqual([]);
  });

  it('returns the observer so the caller can disconnect it', () => {
    const observer = activateIntersectionOnce([mount('<div></div>')]);

    expect(observer).toBe(lastObserver());
  });

  it('honours a custom active class', () => {
    const element = mount('<div></div>');
    activateIntersectionOnce([element], 'seen');

    enter(element);

    expect(element.classList.contains('seen')).toBe(true);
  });

  it('waits for the element to be fully visible by default', () => {
    activateIntersectionOnce([mount('<div></div>')]);

    expect(lastObserver().thresholds).toEqual([1]);
  });

  it('skips a mobile-only element on a wide viewport', () => {
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersectionOnce([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(false);
  });

  it('activates a mobile-only element on a narrow viewport', () => {
    stubMatchMedia((query) => query.includes('max-width: 600px'));
    const element = mount('<div class="observer-mobile-only"></div>');
    activateIntersectionOnce([element]);

    enter(element);

    expect(element.classList.contains('active')).toBe(true);
  });
});
