import fc from 'fast-check';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type IScrollClassSettings,
  scrollClass,
  setLazyAttributes,
  setLazyload,
  shyel,
  stickyel,
} from '../src/index';
import { mount, scrollTo, setOffsetHeight, setRectTop } from './helpers/dom';

/** Class names that are legal in markup, so the arbitrary never tests the DOM parser instead. */
const classNameArb = fc.constantFrom('alpha', 'beta', 'gamma', 'delta', 'epsilon');

const instructionArb = fc.record({
  class: classNameArb,
  scroll: fc.nat({ max: 3000 }),
  remove: fc.boolean(),
});

/**
 * Instructions are keyed by class name. Two naming the same class contradict
 * each other, which is the caller's problem, not a contract to test.
 */
const instructionsArb = fc.uniqueArray(instructionArb, {
  minLength: 1,
  maxLength: 4,
  selector: (instruction) => instruction.class,
});

const scrollPositionArb = fc.nat({ max: 4000 });

const settle = () => vi.advanceTimersByTime(200);

/**
 * Each run gets a fresh page: a scroll position left behind by the previous
 * run offsets every resting position the next one measures.
 */
const freshPage = () => {
  document.body.innerHTML = '';
  scrollTo(0);
};

/** outerHTML minus the id the harness assigns, for comparing two built elements. */
const shape = (element: Element) => {
  const clone = element.cloneNode(true) as Element;
  clone.removeAttribute('id');
  return clone.outerHTML;
};

describe('setLazyAttributes properties', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * The whole job is moving a value between attributes untouched. Any
   * normalisation would rewrite URLs — query strings, encoded characters.
   */
  it('carries the placeholder value through unchanged', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const element = mount('<img />');
        element.setAttribute('data-src', value);

        setLazyAttributes(element);

        expect(element.getAttribute('src')).toBe(value);
      })
    );
  });

  it('carries the srcset placeholder through unchanged', () => {
    fc.assert(
      fc.property(fc.string(), (value) => {
        const element = mount('<source />');
        element.setAttribute('data-srcset', value);

        setLazyAttributes(element);

        expect(element.getAttribute('srcset')).toBe(value);
      })
    );
  });

  /**
   * Elements are re-processed whenever they are re-observed, so only the first
   * pass may change anything: a later one would wipe the src it just set.
   */
  it('reaches a fixed point after one pass', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.boolean(), fc.boolean(), (src, srcset, hasSrc, hasSrcset) => {
        const element = mount('<img />');
        if (hasSrc) element.setAttribute('data-src', src);
        if (hasSrcset) element.setAttribute('data-srcset', srcset);

        setLazyAttributes(element);
        const settled = element.outerHTML;

        expect(setLazyAttributes(element)).toBe(false);
        expect(element.outerHTML).toBe(settled);
      })
    );
  });

  /**
   * applyLazyImage decides whether to attach a load listener from this, so it
   * has to mean exactly "the DOM changed".
   */
  it('returns true exactly when it changed something', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), fc.string(), (hasSrc, hasSrcset, value) => {
        const element = mount('<img />');
        if (hasSrc) element.setAttribute('data-src', value);
        if (hasSrcset) element.setAttribute('data-srcset', value);
        const before = element.outerHTML;

        const changed = setLazyAttributes(element);

        expect(changed).toBe(element.outerHTML !== before);
        expect(changed).toBe(hasSrc || hasSrcset);
      })
    );
  });

  /**
   * The prefix is caller configuration and is validated nowhere. An unusual one
   * must simply find nothing, never throw into the caller's scroll handler.
   */
  it('never throws, whatever the prefix', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (prefix, value) => {
        const element = mount('<img />');
        element.setAttribute('data-src', value);

        expect(() => setLazyAttributes(element, prefix)).not.toThrow();
      })
    );
  });
});

describe('setLazyload properties', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const lazyTags = ['img', 'picture', 'video'] as const;
  const inertTags = ['div', 'span', 'a', 'source', 'p'] as const;

  /**
   * Dispatch is by tag name: a data-src elsewhere is some other script's state,
   * and promoting it would corrupt it.
   */
  it('never touches an element whose tag it does not handle', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...inertTags), { maxLength: 6 }), (tags) => {
        const elements = tags.map((tag) => mount(`<${tag} data-src="a.jpg" data-srcset="b 1x"></${tag}>`));
        const before = elements.map((element) => element.outerHTML);

        setLazyload(elements);

        expect(elements.map((element) => element.outerHTML)).toEqual(before);
      })
    );
  });

  /**
   * Callers pass whatever querySelectorAll returned, so a batch has to behave
   * like its elements one at a time — otherwise the result depends on how the
   * caller happened to group its selectors.
   */
  it('treats a batch exactly like the same elements one at a time', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...lazyTags, ...inertTags), { maxLength: 6 }), (tags) => {
        const markup = (tag: string) => `<${tag} data-src="a.jpg" data-srcset="b 1x"></${tag}>`;

        const batch = tags.map((tag) => mount(markup(tag)));
        setLazyload(batch);

        const individually = tags.map((tag) => mount(markup(tag)));
        for (const element of individually) setLazyload([element]);

        expect(batch.map(shape)).toEqual(individually.map(shape));
      })
    );
  });
});

describe('scrollClass properties', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    scrollTo(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** What the element must look like at a given scroll position. */
  const expected = (instruction: IScrollClassSettings, y: number) =>
    instruction.remove ? !(y > instruction.scroll) : y > instruction.scroll;

  it('matches the threshold rule for every instruction at every position', () => {
    fc.assert(
      fc.property(instructionsArb, scrollPositionArb, (instructions, y) => {
        freshPage();
        const element = mount('<div></div>');
        const teardown = scrollClass(element, instructions);
        try {
          scrollTo(y);
          settle();

          for (const instruction of instructions)
            expect(element.classList.contains(instruction.class)).toBe(expected(instruction, y));
        } finally {
          teardown();
        }
      })
    );
  });

  /**
   * The state is a function of where the page is, not how it got there. A
   * path-dependent result means a class latched on and never cleared.
   */
  it('lands in the same state regardless of the route taken', () => {
    fc.assert(
      fc.property(
        instructionsArb,
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 8 }),
        (instructions, path) => {
          const destination = path.at(-1)!;

          freshPage();
          const travelled = mount('<div></div>');
          const travelledTeardown = scrollClass(travelled, instructions);
          const direct = mount('<div></div>');
          const directTeardown = scrollClass(direct, instructions);

          try {
            for (const y of path) {
              scrollTo(y);
              settle();
            }
            // `direct` was attached before the walk, so one settle at the
            // destination is all it ever sees.
            scrollTo(destination);
            settle();

            expect(travelled.className.split(' ').sort()).toEqual(direct.className.split(' ').sort());
          } finally {
            travelledTeardown();
            directTeardown();
          }
        }
      )
    );
  });
});

describe('stickyel properties', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    scrollTo(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * The class exists so CSS can react to the pinned state. Let it disagree with
   * the inline `position: fixed` and that CSS styles an unpinned element.
   */
  it('keeps the class and the pinned layout in agreement', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 8 }),
        (restingTop, path) => {
          freshPage();
          const element = mount('<div></div>');
          setRectTop(element, restingTop);
          const teardown = stickyel(element);
          try {
            for (const y of path) {
              scrollTo(y);
              settle();
              expect(element.classList.contains('stickyel-active')).toBe(
                element.style.position === 'fixed'
              );
            }
          } finally {
            teardown();
          }
        }
      )
    );
  });

  it('is pinned exactly when the page has reached its resting offset', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 8 }),
        (restingTop, path) => {
          freshPage();
          const element = mount('<div></div>');
          setRectTop(element, restingTop);
          const teardown = stickyel(element);
          try {
            for (const y of path) {
              scrollTo(y);
              settle();
            }
            expect(element.classList.contains('stickyel-active')).toBe(path.at(-1)! >= restingTop);
          } finally {
            teardown();
          }
        }
      )
    );
  });
});

describe('shyel properties', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    scrollTo(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const shyelArb = fc.record({
    threshold: fc.nat({ max: 1000 }),
    intensity: fc.nat({ max: 200 }),
    height: fc.integer({ min: 1, max: 400 }),
  });

  /**
   * Show and hide are opposites. Both at once leaves the outcome to whichever
   * CSS rule wins the cascade, which the caller cannot predict.
   */
  it('never leaves both classes on the element', () => {
    fc.assert(
      fc.property(
        shyelArb,
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 10 }),
        ({ threshold, intensity, height }, path) => {
          freshPage();
          const element = mount('<header></header>');
          setOffsetHeight(element, height);
          const teardown = shyel(element, threshold, { intensity });
          try {
            for (const y of path) {
              scrollTo(y);
              settle();
              expect(
                element.classList.contains('shyel-show') && element.classList.contains('shyel-hide')
              ).toBe(false);
            }
          } finally {
            teardown();
          }
        }
      )
    );
  });

  /**
   * The inline offset is the visual half of the hidden state. Left behind
   * without the class, the header stays off screen with nothing to explain why.
   */
  it('keeps the offset and the hide class in agreement', () => {
    fc.assert(
      fc.property(
        shyelArb,
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 10 }),
        ({ threshold, intensity, height }, path) => {
          freshPage();
          const element = mount('<header></header>');
          setOffsetHeight(element, height);
          const teardown = shyel(element, threshold, { intensity });
          try {
            for (const y of path) {
              scrollTo(y);
              settle();
              const hidden = element.classList.contains('shyel-hide');
              expect(element.style.top).toBe(hidden ? `-${String(height + 1)}px` : '');
            }
          } finally {
            teardown();
          }
        }
      )
    );
  });

  /**
   * Below the threshold the header is unconditionally visible — that is what
   * the threshold means. No scroll history may leave it hidden there.
   */
  it('always shows the header below the threshold', () => {
    fc.assert(
      fc.property(
        shyelArb,
        fc.array(scrollPositionArb, { minLength: 1, maxLength: 8 }),
        scrollPositionArb,
        ({ threshold, intensity, height }, path, last) => {
          fc.pre(last >= 10 && last < threshold);

          freshPage();
          const element = mount('<header></header>');
          setOffsetHeight(element, height);
          const teardown = shyel(element, threshold, { intensity });
          try {
            for (const y of [...path, last]) {
              scrollTo(y);
              settle();
            }
            expect(element.classList.contains('shyel-show')).toBe(true);
            expect(element.classList.contains('shyel-hide')).toBe(false);
          } finally {
            teardown();
          }
        }
      )
    );
  });

  /**
   * The top of the page is deliberately inert: momentum scrolling and browser
   * chrome resizing fake movement there, which would flicker the header.
   */
  it('does nothing at all in the first 10px', () => {
    fc.assert(
      fc.property(shyelArb, fc.nat({ max: 9 }), ({ threshold, intensity, height }, y) => {
        freshPage();
        const element = mount('<header></header>');
        setOffsetHeight(element, height);
        const teardown = shyel(element, threshold, { intensity });
        try {
          scrollTo(y);
          settle();

          expect(element.className).toBe('');
          expect(element.style.top).toBe('');
        } finally {
          teardown();
        }
      })
    );
  });
});
