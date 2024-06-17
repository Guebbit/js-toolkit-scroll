import { throttle } from 'lodash';

/**
 * Emulate and extend "position: sticky"
 *
 * @param element - element to render sticky
 * @param className - class name added in "stuck mode"
 * @param $window - window instance that could be different from global window (like in cypress tests)
 * @return function - call this function to call removeEventListener on this
 */
export default (element :HTMLElement | null, className = 'stickyel-active', $window: Window = window)  => {
  // element must be present
  if(!element)
    return () => {};

  // helper: lessen the weight to check element status
  let activeFlag = false;
  // needed to check when element is back in its original position
  const { top :initialElementTop } = element.getBoundingClientRect();

  const handleScroll = throttle(function() :void {
    // distance from top of element (can't change when position:fixed)
    const { top :currentElementTop } = element.getBoundingClientRect();

    // active sticky mode: the element hit the "roof"
    if(!activeFlag && currentElementTop < 10){
      activeFlag = true;
      element.style.position = 'fixed';
      element.style.top = '0px';
      element.classList.add(className);
    }
    // remove sticky mode: element is fixed on top and the initial scroll scroll position reached the window scroll
    if(activeFlag && currentElementTop === 0 && initialElementTop > $window.scrollY){
      activeFlag = false;
      element.style.removeProperty('position');
      element.style.removeProperty('top');
      element.classList.remove(className);
    }
  }, 10);

  // add the event...
  $window.addEventListener('scroll', handleScroll);
  // ... and remove it later calling the returned function
  return () => {
    $window.removeEventListener('scroll', handleScroll);
  };
};
