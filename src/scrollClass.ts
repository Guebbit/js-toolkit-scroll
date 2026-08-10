import { formatNodeList } from "@guebbit/js-toolkit"

import { type IScrollOptions, onFrame } from './onFrame';

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
 * @param settings - rate-limit strategy for the scroll handler
 */
export const scrollClass = (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, instructions: IScrollClassSettings[], settings: IScrollOptions = {}): () => void => {
  // formatNodeList knows NodeList and arrays; an HTMLCollection is neither, so
  // it would wrap the whole collection as a single "element". The typeof guard
  // is for the no-DOM case, which is how an SSR render reaches this line.
  const elementsArray = formatNodeList(
    typeof HTMLCollection !== 'undefined' && element instanceof HTMLCollection
      ? ([...element] as HTMLElement[])
      : element
  );

  // Get the window instance from the element's owner document (required for cypress tests)
  if (elementsArray.length === 0)
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  const $window = elementsArray[0].ownerDocument.defaultView ?? globalThis;
  const { wrap = onFrame } = settings;

  const handleScroll = wrap(function (): void {
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
  });

  $window.addEventListener('scroll', handleScroll);

  // Return a function to remove the event listener
  return () => {
    $window.removeEventListener('scroll', handleScroll);
    // A run queued but not yet made would otherwise still touch elements the
    // caller has already finished with.
    handleScroll.cancel?.();
  };
};
