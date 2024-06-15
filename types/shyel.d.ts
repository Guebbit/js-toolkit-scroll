export interface IShyelSettings {
    elementHeight?: number | string;
    intensity?: number;
    className?: string;
    shyClassName?: string;
}
/**
 * Header (recommended)  that hide or show based on user scroll movements.
 *
 * @param element - the element that is gonna hide or show
 * @param threshold - threshold activation for hiding. After how much we activate hide function
 * @param settings - some settings to customize the stickyness
 * @param $window
 */
declare const _default: (element: HTMLElement | null, threshold?: number, settings?: IShyelSettings, $window?: Window) => void;
export default _default;
//# sourceMappingURL=shyel.d.ts.map