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
 */
export declare const scrollClass: (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, instructions: IScrollClassSettings[]) => () => void;
