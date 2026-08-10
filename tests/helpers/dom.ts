import { vi } from 'vitest';

/**
 * A controllable stand-in for the browser's IntersectionObserver.
 *
 * jsdom ships none, so without this the fallback branch is the only one a test
 * can reach. `emit` also delivers entries at an exact moment, which is the only
 * way to pin down ordering a real browser schedules on its own.
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
 * The library branches on `"IntersectionObserver" in globalThis` and
 * `vi.stubGlobal(name, undefined)` leaves the key in place, so it has to go.
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
 * Move the window and fire the scroll event. jsdom pins scrollY at 0 and does
 * not scroll, so the value the handler reads has to be written directly.
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

/**
 * jsdom reports every layout box as zero; `stickyel` reads
 * getBoundingClientRect().top.
 *
 * A pinned element reports where it was moved to, not where it came from, so
 * the stub answers from the inline offset once `position: fixed` is set. That
 * is what makes "measure while still in flow" an observable requirement rather
 * than an invisible one.
 */
export const setRectTop = (element: HTMLElement, top: number): void => {
  element.getBoundingClientRect = () => {
    const reported =
      element.style.position === 'fixed' ? Number.parseFloat(element.style.top || '0') : top;
    return {
      top: reported,
      bottom: reported,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: reported,
    } as DOMRect;
  };
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
 * is real. Each element gets a unique id: vitest compares DOM nodes
 * structurally, so without one two bare `<div>`s satisfy any assertion about
 * either, and a test reporting the wrong element still passes.
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
 * The first argument of every call a spy received. Assert with `toContain`
 * (by reference) rather than `toHaveBeenCalledWith` (structural).
 */
export const firstArgs = <T>(spy: { mock: { calls: unknown[][] } }): T[] =>
  spy.mock.calls.map((call) => call[0] as T);
