/**
 * Get value of an HTML element
 *
 * @param element
 * @param attribute - if not empty: it's an attribute
 */
export default (element :HTMLElement | null, attribute = '') :string | number | boolean | null => {
	//if non valid element
	if(!element)
		return null;
	//if it's attribute
	if(attribute.length > 0)
		return element.getAttribute(attribute);
	//if its checkbox\radiobutton
	if((element as HTMLInputElement).type === 'checkbox')
		return (element as HTMLInputElement).checked;
	if((element as HTMLInputElement).type === 'radio'){
		const { parentElement } = element;
		if(!parentElement)
			return null;
		return (parentElement.querySelector('input[name="'+element.getAttribute('name')+'"]:checked') as HTMLInputElement).value;
	}
	return (element as HTMLInputElement | HTMLSelectElement).value || element.innerText || element.textContent;
}
