/**
 * Converts a single HTMLElement or a collection of HTMLElements into an standardized array of HTMLElements.
 * @param elementsArray
 */
export default (elementsArray :HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null) :HTMLElement[] => {
  if(!elementsArray)
    return [];
  if(elementsArray instanceof NodeList)
    elementsArray = Array.prototype.slice.call(elementsArray);
  if(!Array.isArray(elementsArray))
    elementsArray = [(elementsArray as HTMLElement)];
  return [...elementsArray];
}
