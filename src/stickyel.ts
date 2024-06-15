import { throttle } from 'lodash';

/**
 * Equivalent of position:sticky, but more secure and customizable (className as "stuck mode")
 *
 * @param {HTMLElement | null} element - element to render sticky
 * @param {string} className - className added in "stuck mode"
 * @param {window} $window - TODO REMOVE (cypress only)
 */

/**
 * Emulate and extend "position: sticky"
 *
 * @param element
 * @param className
 * @param $window -
 * @return event - to be later removed
 */
export default (element :HTMLElement | null, className = 'stickyel-active', $window :Window = window ) :void => {
  if(!element)
    return;

  // helper: lessen the weight to check element status
  let activeFlag = false;
  // needed to check when element is back in it's original position
  const { top :initialElementTop } = element.getBoundingClientRect();

  return window.addEventListener('scroll', throttle(function() :void {
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
    if(activeFlag && currentElementTop === 0 && initialElementTop > window.scrollY){
      activeFlag = false;
      element.style.removeProperty('position');
      element.style.removeProperty('top');
      element.classList.remove(className);
    }
  }, 10));
};
