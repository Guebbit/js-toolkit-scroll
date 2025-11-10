/**
 * Emulate and extend "position: sticky"
 *
 * @param element - element to render sticky
 * @param className - class name added in "stuck mode"
 * @return function - call this function to call removeEventListener on this
 */
export declare const stickyel: (element: HTMLElement | null, className?: string) => () => void;
