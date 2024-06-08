/**
 * Equivalent of Jquery .index()
 *
 * @param element
 */
export default (element :HTMLElement | null) :number => {
	if(!element)
		return -1;
	const parent :HTMLElement | null = element.parentElement;
	if(!parent)
		return -1;
	return Array.from(parent.children).indexOf(element);
}
