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
 * @param $window - window instance that could be different from global window (like in cypress tests)
 */
export default (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, instructions: IScrollClassSettings[], $window: Window = window): () => void => {
  const elementsArray = formatNodeList(element);
  if (elementsArray.length < 1)
    return () => {};

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
        const { class: classs, scroll = 0, remove = false } = instructions[i]!;
        // se remove non è specificato, allora è false
        if (!remove) {
          // add on scrolling, oltre una certa soglia aggiungo la classe
          if ($window.scrollY > scroll) {
            elementsArray[k]!.classList.add(classs);
          } else {
            elementsArray[k]!.classList.remove(classs);
          }
        } else {
          // remove on scrolling, oltre una certa soglia rimuovo la classe
          if ($window.scrollY > scroll) {
            elementsArray[k]!.classList.remove(classs);
          } else {
            elementsArray[k]!.classList.add(classs);
          }
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
