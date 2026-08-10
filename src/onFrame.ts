/**
 * A scroll handler, wrapped so it does not run once per event.
 * `cancel` drops any run that is queued but has not happened yet.
 */
export interface IWrappedScrollHandler {
  (): void,
  cancel?: () => void
}

/**
 * Takes a scroll handler and returns a rate-limited version of it.
 *
 * The handlers in this library take no arguments and read the scroll position
 * when they run, so skipping a call costs nothing: the next one sees the same
 * state and reaches the same result. That is what makes them safe to rate-limit
 * at all, and why the wrapper only has to return a callable.
 */
export type IScrollHandlerWrapper = (handler: () => void) => IWrappedScrollHandler;

/** Settings shared by everything in this library that listens to scroll. */
export interface IScrollOptions {
  /**
   * Rate-limit strategy for the scroll handler.
   * Defaults to one run per animation frame. Pass your own to choose different
   * timings, for example lodash's throttle or debounce.
   */
  wrap?: IScrollHandlerWrapper
}

/**
 * Coalesce a handler to one run per animation frame.
 *
 * Scroll events arrive far faster than the screen updates, and these handlers
 * only ever read the scroll position and then write a class or an offset. Doing
 * that on a timer lands the write at an arbitrary point in the frame, forcing
 * the browser to recalculate layout it had already settled. Running on the
 * frame boundary instead means the work happens once, immediately before the
 * paint that displays it.
 */
export const onFrame: IScrollHandlerWrapper = (handler: () => void): IWrappedScrollHandler => {
  let frame = 0;

  const wrapped: IWrappedScrollHandler = () => {
    // Already queued for this frame: the pending run will read the newer
    // scroll position anyway, so there is nothing to gain from a second one.
    if (frame)
      return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      handler();
    });
  };

  wrapped.cancel = () => {
    // Equivalent-mutant note: cancelAnimationFrame ignores an id it does not
    // know, so dropping this guard changes nothing observable. It is here to say
    // what the code means, not to prevent an error.
    if (!frame)
      return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  return wrapped;
};
