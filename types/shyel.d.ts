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
 * @return function - call this function to call removeEventListener on this
 */
export declare const shyel: (element: HTMLElement | null, threshold?: number, settings?: IShyelSettings) => () => void;
