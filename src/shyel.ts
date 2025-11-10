import { throttle } from 'lodash';

export interface IShyelSettings {
  // how much go back on top (auto = element calculated height)
  // can be needed in special cases
  elementHeight?: number | string,
  // how much intensity of scroll does trigger the shy (hide) effect
  intensity?: number,
  // class that applies when stick to the top
  classShow?: string
  // class that applies when hide
  classHide?: string
}

/**
 * Header (recommended)  that hide or show based on user scroll movements.
 *
 * @param element - the element that is gonna hide or show
 * @param threshold - threshold activation for hiding. After how much we activate hide function
 * @param settings - some settings to customize the stickyness
 * @return function - call this function to call removeEventListener on this
 */
export const shyel = (element: HTMLElement | null, threshold = 0, settings: IShyelSettings = {}) :() => void => {
  if (!element)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};

  // settings
  const {
    elementHeight = 'auto',
    intensity = 0,
    classShow = 'shyel-show',
    classHide = 'shyel-hide',
  } = settings;

  // Get the window instance from the element's owner document (required for cypress tests)
  const $window = element.ownerDocument.defaultView ?? globalThis;
  // determine height if not specified (should never be specified)
  const hideTop = elementHeight === 'auto' ? element.offsetHeight + 1 : elementHeight as number;
  // record last scroll position, to determine the direction of the next, and to check intensity
  let lastScrollY = 0;

  const handleScroll = throttle(function () :void {
    // scroll of window
    const scrollY = $window.scrollY;

    // WARNING: if on top of page (10px?) DO NOT hide. Bugs can occur.
    if (scrollY < 10)
      return;

    // if we are under scroll threshold, do not apply (and remove if any) shyness
    if (scrollY < threshold) {
      if (hideTop != 0)
        element.style.top = '';
      element.classList.remove(classHide);
      element.classList.add(classShow);
      return;
    }

    // if the intensity isn't enough, don't change.
    if (Math.abs(scrollY - lastScrollY) < intensity)
      return;

    // Detect scroll direction
    if (scrollY >= lastScrollY) {
      // Towards Bottom
      // add shy mode: hide header, and apply class (if any)
      if (hideTop != 0)
        element.style.top = -hideTop + 'px';
      element.classList.add(classHide);
      element.classList.remove(classShow);
    } else {
      // Towards Top
      // remove shy mode: when scrolling top, header need to reappear, and apply class (if any)
      if (hideTop != 0)
        element.style.top = '';
      element.classList.remove(classHide);
      element.classList.add(classShow);
    }

    // save last scroll
    lastScrollY = scrollY;
  }, 20);

  // add the event...
  $window.addEventListener('scroll', handleScroll);
  // ... and remove it later calling the returned function
  return () => {
    $window.removeEventListener('scroll', handleScroll);
  };
};
