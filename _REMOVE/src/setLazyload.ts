import formatNodeList from "./formatNodeList";

/**
 * Set lazyload on <source> tag
 * Updates src and srcset to data-src and data-srcset, then remove the original attributes.
 * Tell me if changes were made
 * @param element
 */
export const setLazyloadAttributes = function (element: Element): boolean {
  let flag = false;
  if (element.hasAttribute("data-src")) {
    element.setAttribute("src", (element.getAttribute("data-src") as string));
    element.removeAttribute("data-src");
    flag = true;
  }
  if (element.hasAttribute("data-srcset")) {
    element.setAttribute("srcset", (element.getAttribute("data-srcset") as string));
    element.removeAttribute("data-srcset");
    flag = true;
  }
  return flag;
}

/**
 * Set lazyload to <video>
 * @param video
 */
export const setLazyloadLoadVideo = async function (video: HTMLVideoElement): Promise<boolean> {
  // Sfruttiamo il metodo race
  return await Promise.race([
    // Creiamo la prima promise, che si risolve
    // in corrispondenza dell'evento video.canplaythrough
    new Promise((resolve) => {
      video.addEventListener('canplaythrough', () => {
        // can play
        resolve(true);
      });
    }),
    // Creiamo la seconda promise, che si risolve
    // dopo un tempo predefinito (2 secondi)
    new Promise((resolve) => {
      setTimeout(() => {
        //video timedout
        resolve(false);
      }, 5000);
    }),
    //vediamo quale promise "ha fatto prima"
  ]).then((play) => {
    if (video.classList.contains('loaded'))
      return true;
    if (play) {
      video.play();
      video.classList.add('loaded');
      return true;
    }
    // rimuovo i source (che non hanno caricato in tempo)
    (Array.from(video.children) as HTMLElement[]).forEach((child: HTMLElement) => {
      if (child.tagName === 'SOURCE' && typeof child.dataset['src'] !== 'undefined')
        child.parentNode!.removeChild(child);
      return true;
    });
    // Ricarico il video senza source, per resettarlo
    video.load();
    return false;
  });
}


/**
 * Set lazyload to <video> tag and it's <source>s
 * @param video
 */
export const setLazyloadApplyToVideo = function (video: HTMLVideoElement): boolean {
  if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)
    return true;
  if (window.matchMedia('(prefers-reduced-motion)').matches)
    return false;
  const children = Array.from(video.children);
  children.forEach(child => setLazyloadAttributes(child));
  setLazyloadLoadVideo(video);
  return true;
}

/**
 * Set lazyload to <img>
 * @param element
 */
export const setLazyloadApplyToImage = function (element: HTMLImageElement): boolean {
  if (!setLazyloadAttributes(element))
    return false;
  element.onload = function () {
    (this as HTMLElement).classList.add('loaded');
  };
  return true;
}

/**
 * Set lazyload to <source> of <img>
 * @param element
 */
export const setLazyloadApplyToSource = function (element: HTMLSourceElement): boolean {
  if (!setLazyloadAttributes(element))
    return false;
  try {
    element!.parentNode!.querySelector("img")!.onload = function () {
      (this as HTMLElement).classList.add('loaded');
    };
  } catch (e) {
    // source has no img
    return false;
  }
  return true;
}

/**
 * Set lazyload to targeted element
 * @param element
 */
export default function (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null): void {
  if (!element)
    return;

  let i: number;
  const elementsArray = formatNodeList(element);

  for (i = elementsArray.length; i--;)
    if (elementsArray[i])
      switch (elementsArray[i]!.tagName) {
        //se immagine
        case "IMG":
          setLazyloadApplyToImage(elementsArray[i] as HTMLImageElement);
          break;
        case "SOURCE":
          setLazyloadApplyToSource(elementsArray[i] as HTMLSourceElement);
          break;
        //case "PICTURE": non serve, funziona con "source"
        case "VIDEO":
          setLazyloadApplyToVideo(elementsArray[i] as HTMLVideoElement);
          break;
      }
}
