import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { onFrame } from '../src/index';

describe('onFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Scroll events arrive far faster than the screen updates. Running the
   * handler on each one repeats work the browser will never get to show.
   */
  it('collapses a burst of calls into a single run', () => {
    const handler = vi.fn();
    const wrapped = onFrame(handler);

    for (let i = 0; i < 50; i += 1) wrapped();

    vi.advanceTimersToNextFrame();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not run the handler before the frame arrives', () => {
    const handler = vi.fn();

    onFrame(handler)();

    expect(handler).not.toHaveBeenCalled();
  });

  /**
   * The point is one run per frame, not one run ever. A later burst has to get
   * its own run or the element stops tracking the page.
   */
  it('runs again on the next frame', () => {
    const handler = vi.fn();
    const wrapped = onFrame(handler);

    wrapped();
    vi.advanceTimersToNextFrame();
    wrapped();
    vi.advanceTimersToNextFrame();

    expect(handler).toHaveBeenCalledTimes(2);
  });

  /**
   * Teardown relies on this: a queued run holds a reference to an element the
   * caller is finished with.
   */
  it('drops a queued run when cancelled', () => {
    const handler = vi.fn();
    const wrapped = onFrame(handler);

    wrapped();
    wrapped.cancel?.();
    vi.advanceTimersByTime(100);

    expect(handler).not.toHaveBeenCalled();
  });

  it('can be used again after cancelling', () => {
    const handler = vi.fn();
    const wrapped = onFrame(handler);

    wrapped();
    wrapped.cancel?.();
    wrapped();
    vi.advanceTimersToNextFrame();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('cancelling with nothing queued is harmless', () => {
    const wrapped = onFrame(vi.fn());

    expect(() => {
      wrapped.cancel?.();
      wrapped.cancel?.();
    }).not.toThrow();
  });

  it('keeps separate wrappers independent', () => {
    const first = vi.fn();
    const second = vi.fn();
    const wrappedFirst = onFrame(first);
    const wrappedSecond = onFrame(second);

    wrappedFirst();
    wrappedFirst.cancel?.();
    wrappedSecond();
    vi.advanceTimersToNextFrame();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
