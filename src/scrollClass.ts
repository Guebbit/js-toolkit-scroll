import { throttle } from "lodash";
import { formatNodeList } from "@guebbit/js-toolkit"

export interface IScrollClassSettings {
  // class name
  class: string,
  // how many px I have to scroll before acting
  scroll: number,
  // class have to be removed instead of added
  remove?: boolean,
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
export const scrollClass = (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, instructions: IScrollClassSettings[]): () => void => {
  const elementsArray = formatNodeList(element);
  // Get the window instance from the element's owner document (required for cypress tests)

  if (elementsArray.length === 0)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  const $window = elementsArray[0].ownerDocument.defaultView ?? globalThis;

  const handleScroll = throttle(function (): void {
    let i: number,
      k: number;
    // per ogni elemento
    for (k = elementsArray.length; k--; ) {
      if (!elementsArray[k])
        continue;
      // per ogni opzione
      for (i = instructions.length; i--; ) {
        if (!instructions[i])
          continue;
        const { class: classs, scroll = 0, remove = false } = instructions[i];
        // se remove non è specificato, allora è false
        if (remove) {
          // remove on scrolling, oltre una certa soglia rimuovo la classe
          elementsArray[k].classList.toggle(classs, !($window.scrollY > scroll));
        } else {
          // add on scrolling, oltre una certa soglia aggiungo la classe
          elementsArray[k].classList.toggle(classs, $window.scrollY > scroll);
        }
      }
    }
  }, 50);

  $window.addEventListener('scroll', handleScroll);

  // Return a function to remove the event listener
  return () => {
    $window.removeEventListener('scroll', handleScroll);
  };
};
