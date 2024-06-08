/**
 * Add events to
 *
 * Easy remove events using parent.removeEventListener(eventName, eventListener);
 *
 * @param parent
 * @param eventName -  click, mousehover, etc
 * @param childSelector - selector\this
 * @param callback
 * @return addEventListener
 */
export default (
  eventName: string,
  childSelector: string | Node,
  callback: (this: Element, event: Event) => void,
  parent: Node | Window = window,
): void => {
  return parent.addEventListener(eventName, function (event: Event) {
    const clickedElement = event.target;
    let matchingChild: Element | undefined;

    // if it's a string, get the closest element
    if (typeof childSelector === "string")
      matchingChild = (clickedElement as Element).closest(childSelector as string)!;
    // if it's an element, check
    else if (childSelector.contains(clickedElement as Element))
      matchingChild = clickedElement as Element;

    if (matchingChild)
      callback.call(matchingChild, event); // matchingChild  pass as this
  });
}

