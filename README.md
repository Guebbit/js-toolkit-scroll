# @guebbit/js-toolkit-scroll

Scroll-driven DOM helpers with no framework and no runtime configuration: sticky
and auto-hiding headers, classes toggled at scroll thresholds, IntersectionObserver
wrappers, and lazyloading for `<img>`, `<picture>` and `<video>`.

```bash
npm install @guebbit/js-toolkit-scroll
```

Ships CommonJS with TypeScript declarations. Named ESM imports work through
Node's interop, so both of these are fine:

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

---

## Headers

### `stickyel(element, className?)`

Emulates and extends `position: sticky`. Once the page reaches where the element
started, it is pinned to the top and given a class.

```js
const detach = stickyel(document.querySelector('#header'), 'is-pinned');
```

| Argument | Default | |
| --- | --- | --- |
| `element` | — | `HTMLElement \| null`. A null element is a no-op. |
| `className` | `'stickyel-active'` | Added while pinned. |

Returns `() => void`.

The resting position is measured once, from the page rather than the viewport,
so constructing it on an already-scrolled page still works. While pinned the
element carries inline `position: fixed; top: 0`; both are removed on release.

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

`threshold` (default `0`) is the scroll position below which the header is
always shown. The first 10px of the page are ignored outright: that is where
momentum scrolling and mobile browser chrome produce phantom movement.

`classShow` and `classHide` are never both present.

---

## Scroll thresholds

### `scrollClass(elements, instructions)`

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
