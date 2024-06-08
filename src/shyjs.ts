import { throttle } from 'lodash';


export interface stickyjsSettingsMap{
  // how much go back on top (auto = element calculated height)
  // can be needed in special cases
  elementHeight? :number | string,
  // scroll after which apply shy (hide) (example: 300px from top)
  threshold? :number,
  // how much intensity of scroll does trigger the shy (hide) effect
  intensity? :number,
  // class that applies when stick to the top
  className? :string,
  // class that applies when hide
  shyClassName? :string,
}


/**
 *  alternativa sempre valida a position: sticky, con distinzione modalità "sticky"
 *  sticky header che si mostra o nasconde in base allo scroll (transition: top non inclusa)
 *
 *  @param {HTMLElement} element - il fixed nav da spostare
 *  @param {Object} settings
 *  @param {Window} $window - TEMPORARY
 **/
export default (element :HTMLElement | null, settings :stickyjsSettingsMap = {}, $window :Window = window ) :void => {
  if(!element) {
    console.warn("Element were not found");
    return;
  }

  // settings
  const {
    elementHeight = 'auto',
    threshold = 0,
    intensity = 0,
    className = 'shyjs-active'
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
