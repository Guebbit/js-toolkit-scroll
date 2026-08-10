# @guebbit/js-toolkit-scroll

Scroll-driven DOM helpers with no framework and no runtime configuration: sticky
and auto-hiding headers, classes toggled at scroll thresholds, IntersectionObserver
wrappers, and lazyloading for `<img>`, `<picture>` and `<video>`.

```bash
npm install @guebbit/js-toolkit-scroll
```

No runtime dependencies beyond `@guebbit/js-toolkit`. Ships CommonJS with
TypeScript declarations; named ESM imports work through Node's interop, so both
of these are fine:

```js
import { stickyel } from '@guebbit/js-toolkit-scroll';
const { stickyel } = require('@guebbit/js-toolkit-scroll');
```

Everything that attaches a scroll listener returns a **teardown function**. Call
it when the element goes away, or a single-page app leaks a handler per
navigation:

```js
const detach = stickyel(document.querySelector('header'));
// later
detach();
```

Teardown also drops any work already queued for the next frame, so nothing
touches the element after you have finished with it.

## Rate limiting

Scroll events arrive far faster than the screen updates. By default every scroll
handler here is coalesced to **one run per animation frame** — immediately before
the paint that shows the result, so the browser never recalculates layout it had
already settled. Fire a hundred scroll events in one frame and the handler runs
once.

That default needs no configuration. If you want different timings, pass your
own `wrap`. It receives the handler and returns a callable, which is the shape
lodash's `throttle` and `debounce` already have:

```js
import { throttle, debounce } from 'lodash';

// at most once every 100ms
stickyel(header, 'pinned', { wrap: (handler) => throttle(handler, 100) });

// only once movement stops
scrollClass(header, instructions, { wrap: (handler) => debounce(handler, 150) });

// every single scroll event, no rate limiting at all
shyel(header, 300, { wrap: (handler) => handler });
```

`wrap` is accepted by `scrollClass`, `shyel` and `stickyel`. If what you return
has a `cancel` method — lodash's wrappers do — teardown calls it; if it does not,
teardown simply skips that step.

lodash is used above only as the example everyone recognises. It is not a
dependency of this package: bring your own, or write the three lines yourself.

The default is exported as `onFrame` if you want to use it directly:

```js
import { onFrame } from '@guebbit/js-toolkit-scroll';

const onScroll = onFrame(() => updateSomething());
window.addEventListener('scroll', onScroll);
// later
window.removeEventListener('scroll', onScroll);
onScroll.cancel();
```

**Which to choose.** The frame default suits anything that moves with the page —
that is all three helpers here. Use `throttle` when the handler is genuinely
expensive and you would rather it ran less often than every frame. Use `debounce`
only for work that should happen once movement *stops*, never for something the
user watches track the page.

---

## Headers

### `stickyel(element, className?, settings?)`

Emulates and extends `position: sticky`. Once the page reaches where the element
started, it is pinned to the top and given a class.

```js
const detach = stickyel(document.querySelector('#header'), 'is-pinned');
```

| Argument | Default | |
| --- | --- | --- |
| `element` | — | `HTMLElement \| null`. A null element is a no-op. |
| `className` | `'stickyel-active'` | Added while pinned. |
| `settings.wrap` | one run per frame | See [Rate limiting](#rate-limiting). |

Returns `() => void`.

The resting position is measured from the page rather than the viewport, so
constructing it on an already-scrolled page works. It is re-measured whenever the
window resizes, since anything that reflows the page — a rotated phone, a
collapsed banner, a webfont arriving — moves where the element rests. While
pinned the element carries inline `position: fixed; top: 0`; both are removed on
release.

### `shyel(element, threshold?, settings?)`

A header that hides when you scroll down and comes back when you scroll up.
The element needs to be positioned (`fixed` or `sticky`) in your own CSS.

```js
const detach = shyel(document.querySelector('#header'), 300, {
  intensity: 50,
  classShow: 'header--visible',
  classHide: 'header--hidden',
});
```

| `IShyelSettings` | Default | |
| --- | --- | --- |
| `elementHeight` | `'auto'` | How far to lift it. `'auto'` measures `offsetHeight + 1`, so no sliver is left showing. Set `0` for classes only, with no inline `top` — use this if the movement is a CSS animation. |
| `intensity` | `0` | Minimum pixels of movement before it reacts. Guards against a jittery trackpad flipping the header every frame. |
| `classShow` | `'shyel-show'` | Added while visible. |
| `classHide` | `'shyel-hide'` | Added while hidden. |
| `wrap` | one run per frame | See [Rate limiting](#rate-limiting). |

With `elementHeight: 'auto'` the height is re-measured on resize, so a header
that shrinks as you scroll still hides by exactly its own height. An explicit
number is your value and is never overwritten.

`threshold` (default `0`) is the scroll position below which the header is
always shown. The first 10px of the page are ignored outright: that is where
momentum scrolling and mobile browser chrome produce phantom movement.

`classShow` and `classHide` are never both present.

---

## Scroll thresholds

### `scrollClass(elements, instructions, settings?)`

Adds or removes classes as the page passes given scroll positions.

```js
const detach = scrollClass(document.querySelector('#header'), [
  { class: 'is-scrolled', scroll: 200 },
  { class: 'at-top', scroll: 200, remove: true },
]);
```

`elements` accepts an `HTMLElement`, an array, a `NodeList` or an
`HTMLCollection` — whatever `querySelector`, `querySelectorAll`,
`getElementsByClassName` or `.children` handed you.

| `IScrollClassSettings` | | |
| --- | --- | --- |
| `class` | required | The class to toggle. |
| `scroll` | `0` | The threshold, in pixels. Passing it means **strictly greater than**. |
| `remove` | `false` | Invert: the class is present *below* the threshold and stripped above it. |

A third argument takes `{ wrap }` — see [Rate limiting](#rate-limiting).

The result depends only on where the page is now, never on how it got there, so
a fast scroll cannot leave a class latched on.

---

## Intersection

### `setIntersection(elements, settings?)`

An IntersectionObserver wrapper. Returns the observer, or `false` if there was
nothing to observe or the browser has no IntersectionObserver.

```js
const observer = setIntersection(document.querySelectorAll('.reveal'), {
  threshold: 0.5,
  intersectingCallback: (element) => element.classList.add('seen'),
  notIntersectingCallback: (element) => element.classList.remove('seen'),
});
```

| `IIntersectionSettings` | Default | |
| --- | --- | --- |
| `root` | viewport | The element the visibility is measured against. |
| `rootMargin` | `'0px'` | Grows or shrinks the root. Positive values start reacting before the element is on screen. |
| `threshold` | `0` | How much of the element must be visible. `0` fires as soon as any pixel is; `1` waits for all of it. |
| `single` | `false` | Stop observing an element after its first intersection. Applies whether or not a callback was given. |
| `intersectingCallback` | — | `(element: Element) => void` |
| `notIntersectingCallback` | — | `(element: Element) => void` |

Where IntersectionObserver is missing, every element is passed to
`intersectingCallback` immediately and `false` is returned. That is deliberate:
there is no way to know what is visible, and treating everything as visible is
the only reading that does not leave a lazyloaded page permanently blank.

### `activateIntersection(elements?, activeClass?, mobileOnlyClass?, threshold?)`
### `activateIntersectionOnce(elements?, activeClass?, mobileOnlyClass?, threshold?)`

Shortcuts for the common case — add a class when an element scrolls into view:

```js
activateIntersection();      // every .observer-activate
activateIntersectionOnce();  // every .observer-activate-once
```

| | Default |
| --- | --- |
| `elements` | `.observer-activate` / `.observer-activate-once` |
| `activeClass` | `'active'` |
| `mobileOnlyClass` | `'observer-mobile-only'` |
| `threshold` | `1` — the whole element must be on screen |

`activateIntersection` removes the class again on the way out.
`activateIntersectionOnce` leaves it on and stops observing, so a reveal
animation does not replay on every pass.

An element carrying `mobileOnlyClass` is only touched under
`(max-width: 600px)`, so a desktop layout is not left mid-animation by an effect
designed for a narrow viewport. On a wide viewport such an element keeps being
observed, because the viewport can still change.

### Expensive callbacks

The callbacks fire as the browser delivers them — they are not rate-limited, and
they must not be, because each one carries entries no later call repeats. Wrap
`intersectingCallback` in `debounce` and the elements reported in the dropped
calls are never loaded at all.

Rate-limit the **work** instead. Collect the elements as they arrive, then let
lodash schedule one pass over them:

```js
import { debounce } from 'lodash';
import { setIntersection } from '@guebbit/js-toolkit-scroll';

const pending = new Set();

// Takes no arguments and reads the Set when it runs, so debouncing it loses nothing.
const drain = debounce(() => {
  for (const element of pending) expensiveThing(element);
  pending.clear();
}, 100, { maxWait: 500 });

setIntersection(document.querySelectorAll('.heavy'), {
  intersectingCallback: (element) => {
    pending.add(element);
    drain();
  },
  notIntersectingCallback: (element) => pending.delete(element),
});
```

Why this is cheaper than debouncing the callback itself:

- **The Set deduplicates.** An element that enters, leaves and re-enters within
  one window costs one job, not three.
- **`delete` drops what stopped mattering.** Anything scrolled past before the
  drain runs is never processed. Debouncing the callback also skipped work, but
  it skipped whichever elements happened to arrive first.
- **Nothing is silently lost.** Every element is either handled or deliberately
  discarded.

`maxWait` matters: during a continuous scroll a plain `debounce` keeps deferring
and never runs. Use `throttle` instead if you would rather it run at a steady
rate throughout.

This is the same rule the library follows internally — `scrollClass`, `shyel`
and `stickyel` throttle handlers that take no arguments and re-read
`window.scrollY`, so a dropped call costs nothing.

Two more savings worth having:

- `single: true` stops an element being observed once its work is done, so the
  watched set only ever shrinks. Best win for anything one-shot.
- To cap parallel work, collect into an array and start a fixed number at a
  time rather than draining the whole batch.

**When debouncing the callback is fine:** if you are not processing the elements
but recomputing something from them — a scrollspy, a visible count. Update the
Set on every callback and debounce only the recompute.

---

## Lazyloading

Put the real source in `data-src` / `data-srcset` and leave `src` empty or
holding a placeholder:

```html
<img data-src="photo.jpg" alt="">

<picture>
  <source data-srcset="wide.avif" type="image/avif">
  <img data-src="fallback.jpg" alt="">
</picture>

<video muted playsinline>
  <source data-src="clip.webm" type="video/webm">
</video>
```

### `activateLazyload(elements?, forcedElements?, prefix?)`

The one call most pages need:

```js
activateLazyload();
```

Anything matching `.lazyload-forced` loads immediately — use it for
above-the-fold media that must not wait for a scroll. Everything else loads on
approach, starting **500px before** it reaches the viewport, so the file is
already arriving by the time it is visible. Returns the observer.

### `setLazyload(elements, prefix?)`

Loads a set of elements now, dispatching by tag to the three helpers below.
Anything that is not an `<img>`, `<picture>` or `<video>` is left completely
untouched, `data-src` and all — that attribute may well belong to another script.

### `applyLazyImage(img, loadedClass?, prefix?)`
### `applyLazyPicture(picture, loadedClass?, prefix?)`
### `applyLazyVideo(video, loadedClass?, prefix?)`
### `setLazyAttributes(element, prefix?)`

The individual steps, if you want to drive them yourself.

`setLazyAttributes` is the primitive: it moves `data-src` to `src` and
`data-srcset` to `srcset`, and returns whether it changed anything. Running it
twice is a no-op, so re-processing an element is safe.

The `applyLazy*` helpers add `loadedClass` (default `'loaded'`) once the media
has actually loaded — on `load` for images and pictures, `loadeddata` for video.
For a `<picture>` the listener sits on the inner `<img>`, since that is the only
thing that loads and its `load` event does not bubble; the class still lands on
the `<picture>`.

`applyLazyImage` returns `false` and does nothing for an image with no
placeholder: it is already loading on its own.

`applyLazyVideo` returns `false` without loading anything under
`prefers-reduced-motion: reduce`, and leaves an already-playing video alone
rather than restarting it.

`prefix` (default `'data-'`) is threaded through every one of these, so a page
that already uses `data-src` for something else can pick its own convention:

```js
activateLazyload(undefined, undefined, 'lazy-');
```

---

## Testing

| Command | |
| --- | --- |
| `npm test` | Unit and property-based suite (vitest + jsdom). |
| `npm run test:types` | Type-level assertions on the exported signatures. |
| `npm run cy:test` | Browser suite, with its fixture server. |
| `npm run test:pack` | Packs the tarball, installs it clean, imports it as ESM and CJS. |
| `npm run verify` | All of the above plus build and lint. Runs pre-commit and pre-publish. |

### Mutation testing

`npm run test:mutation` runs Stryker over `src/`, then
`npm run test:mutation:check` compares it against the per-file floors in
`mutation-baseline.json`. A file scoring below its floor fails; a file that
improves has its floor rewritten upward, so a regression can never be recorded
as the new normal.

Read `total` against `covered` before chasing a survivor. A total well below the
covered score means no test reaches that code and one needs writing; both low
and close together means the tests run it without checking the result, and an
existing assertion needs sharpening. Survivors that are genuinely equivalent are
marked as such in the source — please don't re-chase them.

### Browser suite

The browser layer covers only what jsdom cannot: intersections decided from real
geometry, and the real, non-bubbling `load` event that marks an image or picture
finished. Two things to know before changing those specs:

- **The viewport is pinned** in `cypress.config.ts`. The fixtures place targets
  at fixed document offsets and the specs scroll to positions computed against
  that viewport, so changing it moves every band they check.
- **A positive `rootMargin` cannot be tested there.** Cypress runs the page in
  an iframe, and with `root: null` the implicit root is the top-level viewport;
  `rootMargin` expands the root but cannot undo the clipping at the iframe
  boundary. A native IntersectionObserver behaves identically. Negative margins
  are fine.

## License

AGPL-3.0-only
