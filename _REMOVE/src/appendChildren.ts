/**
 * Javascript appendChild for arrays
 *
 * @param element
 * @param children
 */
export default (element :HTMLElement | Element, ...children: (HTMLElement | Element | (HTMLElement | Element)[])[]) :HTMLElement | Element => {
	const documentFragment = document.createDocumentFragment();
	children.forEach(child => {
		if (Array.isArray(child))
			child.forEach(child => documentFragment.appendChild(child))
		else
			documentFragment.appendChild(child);
	});
	element.appendChild(documentFragment);
	return element;
}
