import getValue from "./getValue";

/**
 * Get all values from different input and textareas
 * @param form
 * @param selectors
 * @return array of ["name":"value"]
 */
export default (form :HTMLElement | null, selectors = "input, textarea, select") :Record<string, unknown> => {
	if(!form)
		return {};
	let i :number;
  let temp :string | null;

	const results :Record<string, unknown> = {};
  const	elementsArray = Array.from(form.querySelectorAll(selectors));

	for (i = elementsArray.length; i--; ){
		temp = (elementsArray[i] as HTMLElement).getAttribute("name");
		if(temp)
			results[temp] = getValue(elementsArray[i] as HTMLElement);
	}
	return results;
}
