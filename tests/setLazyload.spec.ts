import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  activateLazyload,
  applyLazyImage,
  applyLazyPicture,
  applyLazyVideo,
  setLazyload,
} from '../src/index';
import {
  installIntersectionObserver,
  lastObserver,
  mount,
  stubMatchMedia,
} from './helpers/dom';

/** `load` and `loadeddata` do not bubble in a browser; a bubbling stand-in would hide that. */
const fireNonBubbling = (element: Element, type: string) =>
  element.dispatchEvent(new Event(type, { bubbles: false }));

/** A video that reports itself as idle, which is the state lazyload acts on. */
const idleVideo = (html: string) => {
  const video = mount<HTMLVideoElement>(html);
  Object.defineProperty(video, 'paused', { value: true, configurable: true });
  Object.defineProperty(video, 'ended', { value: false, configurable: true });
  Object.defineProperty(video, 'currentTime', { value: 0, configurable: true });
  Object.defineProperty(video, 'readyState', { value: 0, configurable: true });
  return video;
};

describe('applyLazyImage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('promotes the placeholder and reports that it acted', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    expect(applyLazyImage(image)).toBe(true);
    expect(image.getAttribute('src')).toBe('a.jpg');
  });

  it('marks the image loaded once the browser reports the load', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');
    applyLazyImage(image);

    fireNonBubbling(image, 'load');

    expect(image.classList.contains('loaded')).toBe(true);
  });

  it('honours a custom loaded class', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');
    applyLazyImage(image, 'is-ready');

    fireNonBubbling(image, 'load');

    expect(image.classList.contains('is-ready')).toBe(true);
  });

  it('is not applied until the load actually happens', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    applyLazyImage(image);

    expect(image.classList.contains('loaded')).toBe(false);
  });

  /**
   * An image with no placeholder is already loading on its own. Claiming it and
   * marking it later would let a plain <img> pick up the loaded class from a
   * lazyload pass that did nothing.
   */
  it('declines an image that has no placeholder', () => {
    const image = mount<HTMLImageElement>('<img src="a.jpg" />');

    expect(applyLazyImage(image)).toBe(false);

    fireNonBubbling(image, 'load');
    expect(image.classList.contains('loaded')).toBe(false);
  });
});

describe('applyLazyPicture', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('promotes the placeholders on every source', () => {
    const picture = mount<HTMLPictureElement>(`
      <picture>
        <source data-srcset="wide.jpg 2x" />
        <source data-srcset="narrow.jpg 1x" />
        <img data-src="fallback.jpg" />
      </picture>`);

    expect(applyLazyPicture(picture)).toBe(true);

    const sources = [...picture.querySelectorAll('source')];
    expect(sources.map((source) => source.getAttribute('srcset'))).toEqual([
      'wide.jpg 2x',
      'narrow.jpg 1x',
    ]);
    expect(sources.some((source) => source.hasAttribute('data-srcset'))).toBe(false);
  });

  it('promotes the placeholder on the fallback img', () => {
    const picture = mount<HTMLPictureElement>(
      '<picture><img data-src="fallback.jpg" /></picture>'
    );

    applyLazyPicture(picture);

    expect(picture.querySelector('img')?.getAttribute('src')).toBe('fallback.jpg');
  });

  it('promotes a placeholder on the picture element itself', () => {
    const picture = mount<HTMLPictureElement>('<picture data-srcset="a.jpg 1x"></picture>');

    applyLazyPicture(picture);

    expect(picture.getAttribute('srcset')).toBe('a.jpg 1x');
  });

  /**
   * Only the inner <img> ever loads, and its load event does not bubble.
   * Listening on the <picture> means the loaded class is never applied, so any
   * CSS keyed on it — a fade-in, a placeholder swap — never runs.
   */
  it('marks the picture loaded when its inner img loads', () => {
    const picture = mount<HTMLPictureElement>(
      '<picture><source data-srcset="a.jpg 1x" /><img data-src="b.jpg" /></picture>'
    );
    applyLazyPicture(picture);

    fireNonBubbling(picture.querySelector('img')!, 'load');

    expect(picture.classList.contains('loaded')).toBe(true);
  });

  it('honours a custom loaded class', () => {
    const picture = mount<HTMLPictureElement>('<picture><img data-src="b.jpg" /></picture>');
    applyLazyPicture(picture, 'is-ready');

    fireNonBubbling(picture.querySelector('img')!, 'load');

    expect(picture.classList.contains('is-ready')).toBe(true);
  });

  it('is not applied until the load actually happens', () => {
    const picture = mount<HTMLPictureElement>('<picture><img data-src="b.jpg" /></picture>');

    applyLazyPicture(picture);

    expect(picture.classList.contains('loaded')).toBe(false);
  });
});

describe('applyLazyVideo', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('promotes the placeholders on the video and all its sources', () => {
    const video = idleVideo(`
      <video data-src="direct.mp4">
        <source data-src="a.webm" />
        <source data-src="b.mp4" />
      </video>`);

    expect(applyLazyVideo(video)).toBe(true);
    expect(video.getAttribute('src')).toBe('direct.mp4');
    expect([...video.querySelectorAll('source')].map((s) => s.getAttribute('src'))).toEqual([
      'a.webm',
      'b.mp4',
    ]);
  });

  /**
   * Without load() the element keeps showing whatever it resolved at parse
   * time, when the real source was still hidden behind data-src.
   */
  it('tells the element to pick up its new sources', () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    const video = idleVideo('<video><source data-src="a.webm" /></video>');

    applyLazyVideo(video);

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('marks the video loaded once it has data', () => {
    const video = idleVideo('<video data-src="a.mp4"></video>');
    applyLazyVideo(video);

    fireNonBubbling(video, 'loadeddata');

    expect(video.classList.contains('loaded')).toBe(true);
  });

  it('honours a custom loaded class', () => {
    const video = idleVideo('<video data-src="a.mp4"></video>');
    applyLazyVideo(video, 'is-ready');

    fireNonBubbling(video, 'loadeddata');

    expect(video.classList.contains('is-ready')).toBe(true);
  });

  /**
   * Reduced motion is a user request not to autoplay background video.
   * Loading it anyway spends the bandwidth the setting exists to save.
   */
  it('declines to load anything under prefers-reduced-motion', () => {
    stubMatchMedia((query) => query.includes('prefers-reduced-motion'));
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    const video = idleVideo('<video data-src="a.mp4"><source data-src="b.webm" /></video>');

    expect(applyLazyVideo(video)).toBe(false);
    expect(video.hasAttribute('data-src')).toBe(true);
    expect(video.querySelector('source')?.hasAttribute('data-src')).toBe(true);
    expect(load).not.toHaveBeenCalled();
  });

  /**
   * Reloading a video that is already playing restarts it from zero, which the
   * viewer sees as a stutter.
   */
  it('leaves an already playing video alone', () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    const video = mount<HTMLVideoElement>('<video data-src="a.mp4"></video>');
    Object.defineProperty(video, 'currentTime', { value: 5, configurable: true });
    Object.defineProperty(video, 'paused', { value: false, configurable: true });
    Object.defineProperty(video, 'ended', { value: false, configurable: true });
    Object.defineProperty(video, 'readyState', { value: 4, configurable: true });

    expect(applyLazyVideo(video)).toBe(true);
    expect(video.hasAttribute('data-src')).toBe(true);
    expect(load).not.toHaveBeenCalled();
  });
});

/**
 * A page that already uses `data-src` for something else needs a different
 * prefix, and the choice has to reach the element that actually holds the
 * placeholder — the sources inside a picture or video, not just the outer tag.
 */
describe('custom placeholder prefix', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    stubMatchMedia(false);
  });

  it('applyLazyImage honours it', () => {
    const image = mount<HTMLImageElement>('<img lazy-src="a.jpg" />');

    expect(applyLazyImage(image, 'loaded', 'lazy-')).toBe(true);
    expect(image.getAttribute('src')).toBe('a.jpg');
  });

  it('applyLazyPicture passes it down to the sources', () => {
    const picture = mount<HTMLPictureElement>(
      '<picture><source lazy-srcset="a.jpg 1x" /><img lazy-src="b.jpg" /></picture>'
    );

    applyLazyPicture(picture, 'loaded', 'lazy-');

    expect(picture.querySelector('source')?.getAttribute('srcset')).toBe('a.jpg 1x');
    expect(picture.querySelector('img')?.getAttribute('src')).toBe('b.jpg');
  });

  it('applyLazyVideo passes it down to the sources', () => {
    const video = idleVideo('<video lazy-src="a.mp4"><source lazy-src="b.webm" /></video>');

    applyLazyVideo(video, 'loaded', 'lazy-');

    expect(video.getAttribute('src')).toBe('a.mp4');
    expect(video.querySelector('source')?.getAttribute('src')).toBe('b.webm');
  });

  it('setLazyload passes it down to every tag it dispatches', () => {
    const image = mount<HTMLImageElement>('<img lazy-src="a.jpg" />');
    const picture = mount<HTMLPictureElement>('<picture><source lazy-srcset="b.jpg 1x" /></picture>');
    const video = idleVideo('<video><source lazy-src="c.webm" /></video>');

    setLazyload([image, picture, video], 'lazy-');

    expect(image.getAttribute('src')).toBe('a.jpg');
    expect(picture.querySelector('source')?.getAttribute('srcset')).toBe('b.jpg 1x');
    expect(video.querySelector('source')?.getAttribute('src')).toBe('c.webm');
  });

  it('activateLazyload passes it down to both the forced and the observed lists', () => {
    installIntersectionObserver();
    const forced = mount<HTMLImageElement>('<img class="lazyload-forced" lazy-src="hero.jpg" />');
    const deferred = mount<HTMLImageElement>('<img lazy-src="later.jpg" />');

    activateLazyload([deferred], [forced], 'lazy-');
    expect(forced.getAttribute('src')).toBe('hero.jpg');

    lastObserver().emit([{ target: deferred, isIntersecting: true }]);
    expect(deferred.getAttribute('src')).toBe('later.jpg');
  });

  it('leaves the default prefix untouched when a custom one is given', () => {
    const image = mount<HTMLImageElement>('<img data-src="untouched.jpg" lazy-src="a.jpg" />');

    setLazyload([image], 'lazy-');

    expect(image.getAttribute('data-src')).toBe('untouched.jpg');
    expect(image.getAttribute('src')).toBe('a.jpg');
  });
});

describe('applyLazyVideo already-playing detection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * All four conditions have to hold before a video counts as playing. Any one
   * of them false means the element is idle and still needs its sources, so
   * treating the group as "any of" would leave those videos permanently blank.
   */
  const playing = { currentTime: 5, paused: false, ended: false, readyState: 4 };
  const partiallyPlaying: [string, Record<string, unknown>][] = [
    ['it is paused', { ...playing, paused: true }],
    ['it has ended', { ...playing, ended: true }],
    ['it has not started', { ...playing, currentTime: 0 }],
    ['it has no data yet', { ...playing, readyState: 2 }],
  ];

  for (const [label, state] of partiallyPlaying)
    it(`loads the video when ${label}`, () => {
      const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
      const video = mount<HTMLVideoElement>('<video data-src="a.mp4"></video>');
      for (const [key, value] of Object.entries(state))
        Object.defineProperty(video, key, { value, configurable: true });

      expect(applyLazyVideo(video)).toBe(true);
      expect(video.getAttribute('src')).toBe('a.mp4');
      expect(load).toHaveBeenCalledTimes(1);
    });
});

describe('setLazyload', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    stubMatchMedia(false);
  });

  it('does nothing for a null list', () => {
    expect(() => setLazyload(null)).not.toThrow();
  });

  it('does nothing for an empty list', () => {
    expect(() => setLazyload([])).not.toThrow();
  });

  it('lazyloads an img', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    setLazyload([image]);

    expect(image.getAttribute('src')).toBe('a.jpg');
  });

  it('lazyloads a picture and its sources', () => {
    const picture = mount<HTMLPictureElement>(
      '<picture><source data-srcset="a.jpg 1x" /><img data-src="b.jpg" /></picture>'
    );

    setLazyload([picture]);

    expect(picture.querySelector('source')?.getAttribute('srcset')).toBe('a.jpg 1x');
    expect(picture.querySelector('img')?.getAttribute('src')).toBe('b.jpg');
  });

  it('lazyloads a video and its sources', () => {
    const video = idleVideo('<video><source data-src="a.webm" /></video>');

    setLazyload([video]);

    expect(video.querySelector('source')?.getAttribute('src')).toBe('a.webm');
  });

  /**
   * An img has to reach applyLazyImage specifically. Falling through to the
   * picture handler still promotes the placeholder, so the only thing that
   * gives the mistake away is the missing load listener — and with it the
   * loaded class every fade-in transition keys on.
   */
  it('gives an img its own load handling, not the picture one', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    setLazyload([image]);
    fireNonBubbling(image, 'load');

    expect(image.classList.contains('loaded')).toBe(true);
  });

  /**
   * The dispatch passes the loaded class on to each handler. Losing it means
   * the element still gets its source but never gets marked, so every CSS
   * transition keyed on the class stops firing.
   */
  it('marks a picture loaded through the dispatch', () => {
    const picture = mount<HTMLPictureElement>(
      '<picture><source data-srcset="a.jpg 1x" /><img data-src="b.jpg" /></picture>'
    );

    setLazyload([picture]);
    fireNonBubbling(picture.querySelector('img')!, 'load');

    expect(picture.classList.contains('loaded')).toBe(true);
  });

  it('marks a video loaded through the dispatch', () => {
    const video = idleVideo('<video><source data-src="a.webm" /></video>');

    setLazyload([video]);
    fireNonBubbling(video, 'loadeddata');

    expect(video.classList.contains('loaded')).toBe(true);
  });

  /**
   * The dispatch is by tag, not by attribute. A div carrying data-src is
   * somebody else's state; rewriting it to src would corrupt it.
   */
  it('leaves elements of any other tag untouched', () => {
    const div = mount('<div data-src="a.jpg" data-srcset="b.jpg 1x"></div>');
    const before = div.outerHTML;

    setLazyload([div]);

    expect(div.outerHTML).toBe(before);
  });

  it('processes every element in the list', () => {
    const first = mount<HTMLImageElement>('<img data-src="a.jpg" />');
    const second = mount<HTMLImageElement>('<img data-src="b.jpg" />');

    setLazyload([first, second]);

    expect(first.getAttribute('src')).toBe('a.jpg');
    expect(second.getAttribute('src')).toBe('b.jpg');
  });

  it('accepts a NodeList', () => {
    mount('<img class="t" data-src="a.jpg" />');

    setLazyload(document.querySelectorAll('.t'));

    expect(document.querySelector('.t')?.getAttribute('src')).toBe('a.jpg');
  });

  /**
   * querySelectorAll results are dense, but callers hand-build arrays too and a
   * hole must not take the whole pass down with it.
   */
  it('skips holes in the list', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    expect(() =>
      setLazyload([undefined as unknown as Element, image, null as unknown as Element])
    ).not.toThrow();
    expect(image.getAttribute('src')).toBe('a.jpg');
  });
});

describe('activateLazyload', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    stubMatchMedia(false);
    installIntersectionObserver();
  });

  /**
   * The forced list exists for media that must not wait for a scroll —
   * above-the-fold hero images. Deferring them defeats the whole point.
   */
  it('loads forced elements immediately, without an intersection', () => {
    const forced = mount<HTMLImageElement>('<img class="lazyload-forced" data-src="hero.jpg" />');

    activateLazyload(document.querySelectorAll('.nothing'), document.querySelectorAll('.lazyload-forced'));

    expect(forced.getAttribute('src')).toBe('hero.jpg');
  });

  it('defers the regular elements until they intersect', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');

    activateLazyload([image], []);
    expect(image.hasAttribute('data-src')).toBe(true);

    lastObserver().emit([{ target: image, isIntersecting: true }]);
    expect(image.getAttribute('src')).toBe('a.jpg');
  });

  /**
   * The margin is the whole point of lazyloading on scroll: the image has to
   * start downloading before it is on screen or the user watches it appear.
   */
  it('starts loading well before the element reaches the viewport', () => {
    activateLazyload([mount('<img data-src="a.jpg" />')], []);

    expect(lastObserver().rootMargin).toBe('500px 0px');
  });

  it('stops observing an element once it has loaded', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');
    activateLazyload([image], []);

    lastObserver().emit([{ target: image, isIntersecting: true }]);

    expect(lastObserver().unobserved).toContain(image);
  });

  it('returns the observer so the caller can disconnect it', () => {
    const observer = activateLazyload([mount('<img data-src="a.jpg" />')], []);

    expect(observer).toBe(lastObserver());
  });

  it('picks up unforced media by default', () => {
    const image = mount<HTMLImageElement>('<img data-src="a.jpg" />');
    const forced = mount<HTMLImageElement>('<img class="lazyload-forced" data-src="hero.jpg" />');

    activateLazyload();

    expect(forced.getAttribute('src')).toBe('hero.jpg');
    expect(lastObserver().observed).toContain(image);
    expect(lastObserver().observed).not.toContain(forced);
  });
});
