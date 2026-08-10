import { describe, expect, it } from 'vitest';

import { setLazyAttributes } from '../src/index';
import { mount } from './helpers/dom';

describe('setLazyAttributes', () => {
  it('promotes data-src to src and drops the placeholder', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    expect(setLazyAttributes(image)).toBe(true);
    expect(image.getAttribute('src')).toBe('a.jpg');
    expect(image.hasAttribute('data-src')).toBe(false);
  });

  it('promotes data-srcset to srcset and drops the placeholder', () => {
    const source = mount<HTMLSourceElement>('<source data-srcset="a.jpg 1x, b.jpg 2x" />');

    expect(setLazyAttributes(source)).toBe(true);
    expect(source.getAttribute('srcset')).toBe('a.jpg 1x, b.jpg 2x');
    expect(source.hasAttribute('data-srcset')).toBe(false);
  });

  it('promotes both attributes in a single call', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" data-srcset="b.jpg 2x" />');

    expect(setLazyAttributes(image)).toBe(true);
    expect(image.getAttribute('src')).toBe('a.jpg');
    expect(image.getAttribute('srcset')).toBe('b.jpg 2x');
  });

  /**
   * The return value is the whole contract for callers such as applyLazyImage,
   * which uses it to decide whether attaching a load listener is worthwhile.
   * A blanket `true` would make that decision meaningless.
   */
  it('reports false and touches nothing when there is no placeholder', () => {
    const image = mount<HTMLImageElement>('<img src="original.jpg" class="x" />');
    const before = image.outerHTML;

    expect(setLazyAttributes(image)).toBe(false);
    expect(image.outerHTML).toBe(before);
  });

  it('overwrites an existing src with the placeholder value', () => {
    const image = mount<HTMLImageElement>('<img src="placeholder.gif" data-src="real.jpg" />');

    setLazyAttributes(image);

    expect(image.getAttribute('src')).toBe('real.jpg');
  });

  it('honours a custom prefix', () => {
    const image = mount<HTMLImageElement>('<img lazy-src="a.jpg" lazy-srcset="b.jpg 2x" />');

    expect(setLazyAttributes(image, 'lazy-')).toBe(true);
    expect(image.getAttribute('src')).toBe('a.jpg');
    expect(image.getAttribute('srcset')).toBe('b.jpg 2x');
  });

  /**
   * A custom prefix must not also consume the default one, otherwise a page
   * mixing both conventions loses whichever the call was not asked to handle.
   */
  it('leaves the default prefix alone when a custom prefix is given', () => {
    const image = mount<HTMLImageElement>('<img data-src="untouched.jpg" lazy-src="a.jpg" />');

    setLazyAttributes(image, 'lazy-');

    expect(image.getAttribute('data-src')).toBe('untouched.jpg');
  });

  /**
   * Lazyload runs again whenever an element is re-observed. A second pass has
   * to be a no-op, otherwise a re-entering element would clear its own src.
   */
  it('is a no-op on the second pass', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    setLazyAttributes(image);
    const settled = image.outerHTML;

    expect(setLazyAttributes(image)).toBe(false);
    expect(image.outerHTML).toBe(settled);
  });

  it('accepts an empty placeholder value', () => {
    const image = mount<HTMLImageElement>('<img data-src="" />');

    expect(setLazyAttributes(image)).toBe(true);
    expect(image.getAttribute('src')).toBe('');
    expect(image.hasAttribute('data-src')).toBe(false);
  });

  it('works on any element, not just media tags', () => {
    const div = mount<HTMLDivElement>('<div data-src="a.jpg"></div>');

    expect(setLazyAttributes(div)).toBe(true);
    expect(div.getAttribute('src')).toBe('a.jpg');
  });
});
