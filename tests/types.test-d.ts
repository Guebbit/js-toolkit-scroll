import { describe, expectTypeOf, it } from 'vitest';

import {
  activateIntersection,
  activateIntersectionOnce,
  activateLazyload,
  applyLazyImage,
  applyLazyPicture,
  applyLazyVideo,
  type IIntersectionSettings,
  type IScrollClassSettings,
  type IScrollHandlerWrapper,
  type IScrollOptions,
  type IShyelSettings,
  type IWrappedScrollHandler,
  onFrame,
  scrollClass,
  setIntersection,
  setLazyAttributes,
  setLazyload,
  shyel,
  stickyel,
} from '../src/index';

/**
 * The exported types are as much of the API as the functions are. A signature
 * that widens to `any` — through an inference change, a dependency bump, a
 * refactor that drops an annotation — is a breaking change that no runtime
 * assertion can see, because `any` satisfies every runtime test.
 */
describe('exported signatures', () => {
  it('scrollClass takes any element collection and hands back a teardown', () => {
    expectTypeOf(scrollClass).parameter(0).toEqualTypeOf<
      HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null
    >();
    expectTypeOf(scrollClass).parameter(1).toEqualTypeOf<IScrollClassSettings[]>();
    expectTypeOf(scrollClass).returns.toEqualTypeOf<() => void>();
  });

  /**
   * The false arm is what tells a caller the observer could not be created.
   * Collapsing the union to IntersectionObserver would let `observer.disconnect()`
   * type-check and then throw at runtime on an unsupported browser.
   */
  it('setIntersection reports the unsupported case in its return type', () => {
    expectTypeOf(setIntersection).returns.toEqualTypeOf<IntersectionObserver | false>();
    expectTypeOf(setIntersection).parameter(0).toEqualTypeOf<NodeListOf<Element> | Element[] | null>();
    expectTypeOf(setIntersection).parameter(1).toEqualTypeOf<IIntersectionSettings | undefined>();
  });

  it('shyel takes a threshold and settings and hands back a teardown', () => {
    expectTypeOf(shyel).parameter(0).toEqualTypeOf<HTMLElement | null>();
    expectTypeOf(shyel).parameter(1).toEqualTypeOf<number | undefined>();
    expectTypeOf(shyel).parameter(2).toEqualTypeOf<IShyelSettings | undefined>();
    expectTypeOf(shyel).returns.toEqualTypeOf<() => void>();
  });

  it('stickyel takes an element and a class name and hands back a teardown', () => {
    expectTypeOf(stickyel).parameter(0).toEqualTypeOf<HTMLElement | null>();
    expectTypeOf(stickyel).parameter(1).toEqualTypeOf<string | undefined>();
    expectTypeOf(stickyel).parameter(2).toEqualTypeOf<IScrollOptions | undefined>();
    expectTypeOf(stickyel).returns.toEqualTypeOf<() => void>();
  });

  /**
   * The wrapper is the caller's escape hatch from the default frame-coalescing.
   * It has to accept a plain handler and hand back something callable, which is
   * exactly the shape lodash's throttle and debounce already have.
   */
  it('every scroll helper accepts a handler wrapper', () => {
    expectTypeOf(scrollClass).parameter(2).toEqualTypeOf<IScrollOptions | undefined>();
    expectTypeOf<IScrollOptions['wrap']>().toEqualTypeOf<IScrollHandlerWrapper | undefined>();
    expectTypeOf<IShyelSettings['wrap']>().toEqualTypeOf<IScrollHandlerWrapper | undefined>();
  });

  it('onFrame is itself a valid wrapper', () => {
    expectTypeOf(onFrame).toEqualTypeOf<IScrollHandlerWrapper>();
    expectTypeOf(onFrame).returns.toEqualTypeOf<IWrappedScrollHandler>();
  });

  /**
   * These four report whether they acted. A widened return type would let a
   * caller branch on a value that no longer means anything.
   */
  it('the lazy helpers report whether they acted', () => {
    expectTypeOf(setLazyAttributes).returns.toEqualTypeOf<boolean>();
    expectTypeOf(applyLazyImage).returns.toEqualTypeOf<boolean>();
    expectTypeOf(applyLazyPicture).returns.toEqualTypeOf<boolean>();
    expectTypeOf(applyLazyVideo).returns.toEqualTypeOf<boolean>();
  });

  it('the lazy helpers accept only the element they handle', () => {
    expectTypeOf(applyLazyImage).parameter(0).toEqualTypeOf<HTMLImageElement>();
    expectTypeOf(applyLazyPicture).parameter(0).toEqualTypeOf<HTMLPictureElement>();
    expectTypeOf(applyLazyVideo).parameter(0).toEqualTypeOf<HTMLVideoElement>();
    expectTypeOf(setLazyAttributes).parameter(0).toEqualTypeOf<Element>();
  });

  it('setLazyload accepts a nullable element collection', () => {
    expectTypeOf(setLazyload).parameter(0).toEqualTypeOf<NodeListOf<Element> | Element[] | null>();
  });

  /**
   * The placeholder prefix is configurable on setLazyAttributes, so it has to
   * be reachable from every entry point that ends up calling it. A caller using
   * a non-default prefix can otherwise only reach it one element at a time.
   */
  it('every lazy entry point takes the placeholder prefix', () => {
    expectTypeOf(setLazyAttributes).parameter(1).toEqualTypeOf<string | undefined>();
    expectTypeOf(applyLazyImage).parameter(2).toEqualTypeOf<string | undefined>();
    expectTypeOf(applyLazyPicture).parameter(2).toEqualTypeOf<string | undefined>();
    expectTypeOf(applyLazyVideo).parameter(2).toEqualTypeOf<string | undefined>();
    expectTypeOf(setLazyload).parameter(1).toEqualTypeOf<string | undefined>();
    expectTypeOf(activateLazyload).parameter(2).toEqualTypeOf<string | undefined>();
  });

  it('the activate shortcuts return whatever setIntersection returned', () => {
    expectTypeOf(activateIntersection).returns.toEqualTypeOf<IntersectionObserver | false>();
    expectTypeOf(activateIntersectionOnce).returns.toEqualTypeOf<IntersectionObserver | false>();
    expectTypeOf(activateLazyload).returns.toEqualTypeOf<IntersectionObserver | false>();
  });

  /**
   * These take defaults from document.querySelectorAll. Left unannotated their
   * parameter types are inferred as NodeListOf<Element> alone, which rejects the
   * plain arrays every function they delegate to accepts — a restriction with no
   * counterpart in what they actually do at runtime.
   */
  it('the activate shortcuts accept arrays as well as NodeLists', () => {
    type Collection = NodeListOf<Element> | Element[] | undefined;
    expectTypeOf(activateIntersection).parameter(0).toEqualTypeOf<Collection>();
    expectTypeOf(activateIntersectionOnce).parameter(0).toEqualTypeOf<Collection>();
    expectTypeOf(activateLazyload).parameter(0).toEqualTypeOf<Collection>();
    expectTypeOf(activateLazyload).parameter(1).toEqualTypeOf<Collection>();
  });
});

describe('exported settings interfaces', () => {
  /**
   * `class` is the one required field: an instruction without it names nothing.
   * The rest carry defaults, so making them required would break every caller.
   */
  it('IScrollClassSettings requires only the class name', () => {
    expectTypeOf<IScrollClassSettings>().toEqualTypeOf<{
      class: string;
      scroll: number;
      remove?: boolean;
    }>();
  });

  it('IShyelSettings is entirely optional', () => {
    expectTypeOf<IShyelSettings>().toEqualTypeOf<{
      elementHeight?: number | string;
      intensity?: number;
      classShow?: string;
      classHide?: string;
      wrap?: IScrollHandlerWrapper;
    }>();
  });

  it('IScrollOptions carries only the wrapper', () => {
    expectTypeOf<IScrollOptions>().toEqualTypeOf<{ wrap?: IScrollHandlerWrapper }>();
  });

  it('IIntersectionSettings is entirely optional', () => {
    expectTypeOf<IIntersectionSettings>().toEqualTypeOf<{
      root?: Element;
      rootMargin?: string;
      threshold?: number;
      single?: boolean;
      intersectingCallback?: (element: Element) => void;
      notIntersectingCallback?: (element: Element) => void;
    }>();
  });
});

/**
 * `any` is assignable both ways, so a widened export satisfies every other
 * assertion in this file. These catch it head-on.
 */
describe('no export has silently widened to any', () => {
  it('holds for every runtime export', () => {
    expectTypeOf(scrollClass).not.toBeAny();
    expectTypeOf(setIntersection).not.toBeAny();
    expectTypeOf(activateIntersection).not.toBeAny();
    expectTypeOf(activateIntersectionOnce).not.toBeAny();
    expectTypeOf(setLazyload).not.toBeAny();
    expectTypeOf(setLazyAttributes).not.toBeAny();
    expectTypeOf(applyLazyImage).not.toBeAny();
    expectTypeOf(applyLazyPicture).not.toBeAny();
    expectTypeOf(applyLazyVideo).not.toBeAny();
    expectTypeOf(activateLazyload).not.toBeAny();
    expectTypeOf(shyel).not.toBeAny();
    expectTypeOf(stickyel).not.toBeAny();
  });

  it('holds for the return values, not just the functions', () => {
    expectTypeOf(scrollClass).returns.not.toBeAny();
    expectTypeOf(setIntersection).returns.not.toBeAny();
    expectTypeOf(setLazyAttributes).returns.not.toBeAny();
    expectTypeOf(shyel).returns.not.toBeAny();
    expectTypeOf(stickyel).returns.not.toBeAny();
  });
});
