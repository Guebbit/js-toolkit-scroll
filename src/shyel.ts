import { throttle } from 'lodash';


export interface IShyelSettings{
  // how much go back on top (auto = element calculated height)
  // can be needed in special cases
  elementHeight? :number | string,
  // how much intensity of scroll does trigger the shy (hide) effect
  intensity? :number,
  // class that applies when stick to the top
  className? :string,
  // class that applies when hide
  shyClassName? :string,
}


/**
 * Header (recommended)  that hide or show based on user scroll movements.
 *
 * @param element - the element that is gonna hide or show
 * @param threshold - threshold activation for hiding. After how much we activate hide function
 * @param settings - some settings to customize the stickyness
 * @param $window
 */
export default (element :HTMLElement | null, threshold = 0, settings :IShyelSettings = {

}, $window :Window = window ) :void => {
  if(!element) {
    console.warn("Element were not found");
    return;
  }

  // settings
  const {
    elementHeight = 'auto',
    intensity = 0,
    className = 'shyel-active'
  } = settings;
  // determine height if not specified (should never be specified)
  const hideTop = elementHeight === 'auto' ? element.offsetHeight + 1 : elementHeight as number;
  // record last scroll position, to determine the direction of the next, and to check intensity
  let lastScrollY = 0;

  // global event
  $window.addEventListener('scroll', throttle(function() :void {
    // scroll of window
    const scrollY = $window.scrollY;

    // WARNING: if on top of page (10px?) DO NOT hide. Bugs can occur.
    if(scrollY < 10)
      return;

    // if we are under scroll threshold, do not apply (and remove if any) shyness
    if(scrollY < threshold){
      if(hideTop != 0)
        element.style.top = '';
      element.classList.remove(className);
      return;
    }

    // if the intensity isn't enough, don't change.
    if(Math.abs(scrollY - lastScrollY) < intensity)
      return;

    // Detect scroll direction
    if(scrollY >= lastScrollY){
      // Towards Bottom
      // add shy mode: hide header, and apply class (if any)
      if(hideTop != 0)
        element.style.top = -hideTop + 'px';
      element.classList.add(className);
    }else{
      // Towards Top
      // remove shy mode: when scrolling top, header need to reappear, and apply class (if any)
      if(hideTop != 0)
        element.style.top = '';
      element.classList.remove(className);
    }

    // save last scroll
    lastScrollY = scrollY;
  }, 20));
};
