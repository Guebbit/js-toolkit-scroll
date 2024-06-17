export interface IShyelSettings {
    elementHeight?: number | string;
    intensity?: number;
    classShow?: string;
    classHide?: string;
}
/**
 * Header (recommended)  that hide or show based on user scroll movements.
 *
 * @param element - the element that is gonna hide or show
 * @param threshold - threshold activation for hiding. After how much we activate hide function
 * @param settings - some settings to customize the stickyness
 * @param $window - window instance that could be different from global window (like in cypress tests)
 * @return function - call this function to call removeEventListener on this
 */
declare const _default: (element: HTMLElement | null, threshold?: number, settings?: IShyelSettings, $window?: Window) => () => void;
export default _default;
//# sourceMappingURL=shyel.d.ts.map