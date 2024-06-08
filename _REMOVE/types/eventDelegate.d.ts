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
declare const _default: (eventName: string, childSelector: string | Node, callback: (this: Element, event: Event) => void, parent?: Node | Window) => void;
export default _default;
//# sourceMappingURL=eventDelegate.d.ts.map