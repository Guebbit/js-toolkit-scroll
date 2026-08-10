import { vi } from 'vitest';

/**
 * A controllable stand-in for the browser's IntersectionObserver.
 *
 * jsdom ships no IntersectionObserver at all, so without this the library's
 * "no IntersectionObserver" fallback branch is the only branch a test can ever
 * reach. Recording observe/unobserve and exposing `emit` also lets a test
 * deliver entries at an exact moment, which is the only way to pin down
 * ordering behaviour that a real browser decides on its own schedule.
 */
export class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly observed: Element[] = [];
  readonly unobserved: Element[] = [];
  disconnected = false;

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(element: Element): void {
    this.unobserved.push(element);
    const index = this.observed.indexOf(element);
    if (index !== -1) this.observed.splice(index, 1);
  }

  disconnect(): void {
    this.disconnected = true;
    this.observed.length = 0;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Deliver one batch of entries, exactly as the browser would. */
  emit(entries: { target: Element; isIntersecting: boolean }[]): void {
    this.callback(
      entries.map(({ target, isIntersecting }) => makeEntry(target, isIntersecting)),
      this,
    );
  }
}

const makeEntry = (target: Element, isIntersecting: boolean): IntersectionObserverEntry =>
  ({
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRect: target.getBoundingClientRect(),
    rootBounds: null,
    time: 0,
  }) as IntersectionObserverEntry;

/** Install the fake and hand back the registry of instances it creates. */
export const installIntersectionObserver = (): typeof FakeIntersectionObserver.instances => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  return FakeIntersectionObserver.instances;
};

/** The single instance created by the call under test. */
export const lastObserver = (): FakeIntersectionObserver => {
  const observer = FakeIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error('no IntersectionObserver was constructed');
  return observer;
};

/**
 * Run `body` in a world where IntersectionObserver does not exist.
 * `vi.stubGlobal(name, undefined)` leaves the key in place, and the library
 * branches on `"IntersectionObserver" in globalThis`, so the key itself has to
 * go for the fallback path to be reachable.
 */
export const withoutIntersectionObserver = <T>(body: () => T): T => {
  const had = 'IntersectionObserver' in globalThis;
  const previous = (globalThis as Record<string, unknown>).IntersectionObserver;
  delete (globalThis as Record<string, unknown>).IntersectionObserver;
  try {
    return body();
  } finally {
    if (had) (globalThis as Record<string, unknown>).IntersectionObserver = previous;
  }
};

/** Force `matchMedia(query).matches` for the queries the library asks about. */
export const stubMatchMedia = (matches: boolean | ((query: string) => boolean)): void => {
  const decide = typeof matches === 'function' ? matches : () => matches;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: decide(query),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
};

/**
 * Move the window and fire the scroll event.
 * jsdom pins scrollY at 0 and does not implement scrolling, so the value has to
 * be written directly; the library reads `$window.scrollY` inside its handler.
 */
export const scrollTo = (y: number, target: Window = globalThis.window): void => {
  Object.defineProperty(target, 'scrollY', { value: y, configurable: true, writable: true });
  Object.defineProperty(target, 'pageYOffset', { value: y, configurable: true, writable: true });
  target.dispatchEvent(new Event('scroll'));
};

/** jsdom reports every layout box as zero; `shyel` reads offsetHeight for its travel. */
export const setOffsetHeight = (element: HTMLElement, height: number): void => {
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true });
};

/** jsdom reports every layout box as zero; `stickyel` reads getBoundingClientRect().top. */
export const setRectTop = (element: HTMLElement, top: number): void => {
  element.getBoundingClientRect = () =>
    ({ top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top }) as DOMRect;
};

/** Count of listeners currently registered for `type`, to prove teardown detaches. */
export const listenerCounter = (target: EventTarget, type: string) => {
  let count = 0;
  const add = target.addEventListener.bind(target);
  const remove = target.removeEventListener.bind(target);
  vi.spyOn(target, 'addEventListener').mockImplementation((eventType, ...rest) => {
    if (eventType === type) count += 1;
    return add(eventType, ...(rest as [EventListenerOrEventListenerObject]));
  });
  vi.spyOn(target, 'removeEventListener').mockImplementation((eventType, ...rest) => {
    if (eventType === type) count -= 1;
    return remove(eventType, ...(rest as [EventListenerOrEventListenerObject]));
  });
  return () => count;
};

let mountCount = 0;

/**
 * Build an element tree from HTML and attach it, so ownerDocument.defaultView
 * is real.
 *
 * Every element gets a unique id when the markup does not supply one. vitest
 * compares DOM nodes structurally, so without it two bare `<div>`s satisfy any
 * assertion about either one and a test that reports the wrong element still
 * passes.
 */
export const mount = <T extends Element = HTMLElement>(html: string): T => {
  const host = document.createElement('div');
  host.innerHTML = html.trim();
  const element = host.firstElementChild;
  if (!element) throw new Error('mount() needs one root element');
  if (!element.id) element.id = `mounted-${String((mountCount += 1))}`;
  document.body.append(element);
  return element as unknown as T;
};

/**
 * The first argument of every call a spy received.
 * Assert against this with `toContain`, which compares by reference, rather
 * than `toHaveBeenCalledWith`, which compares DOM nodes structurally.
 */
export const firstArgs = <T>(spy: { mock: { calls: unknown[][] } }): T[] =>
  spy.mock.calls.map((call) => call[0] as T);
