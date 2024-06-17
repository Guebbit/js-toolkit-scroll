export interface IScrollClassSettings {
    class: string;
    scroll: number;
    remove?: boolean;
}
/**
 * Classi che aggiungo (o rimuovo) ad un certo scrollY
 * @param {HTMLElement[]} element - l'elemento a cui applicare le classi a seconda della posizione
 * @param {Array} data - array di oggetti
 * @param {Window} $window
 */
/**
 * Add or remove classes at certain scroll thresholds
 *
 * @param element - element where add\remove the classes
 * @param instructions - array of instructions
 * @param $window - window instance that could be different from global window (like in cypress tests)
 */
declare const _default: (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, instructions: IScrollClassSettings[], $window?: Window) => () => void;
export default _default;
//# sourceMappingURL=scrollClass.d.ts.map