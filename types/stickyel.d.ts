/**
 * Emulate and extend "position: sticky"
 *
 * @param element - element to render sticky
 * @param className - class name added in "stuck mode"
 * @param $window - window instance that could be different from global window (like in cypress tests)
 * @return function - call this function to call removeEventListener on this
 */
declare const _default: (element: HTMLElement | null, className?: string, $window?: Window) => () => void;
export default _default;
