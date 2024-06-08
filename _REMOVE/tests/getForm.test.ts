import { getForm } from '../index';

document.body.innerHTML =
	'<form id="form-test">'+
		'<input name="input-test" value="Lorem Ipsum"/>'+
		'<select name="select-test">'+
			'<option value="lorem">ipsum</option>'+
			'<option value="dolor" selected>sit</option>'+
			'<option value="consectetur">adipiscing</option>'+
		'</select>'+
		'<textarea name="textarea-test">elit sed do</textarea>'+
		'<input type="checkbox" name="checkbox-test" name="checkbox-test" value="Eiusmod" checked/>'+
		'<input type="radio" name="radio-test" value="Lorem"/>'+
		'<input type="radio" name="radio-test" value="Ipsum" checked />'+
	'</form>';

describe("(getForm) Get all form-like values paired with their name (ignored if without name)", () => {

	test("Input", () => {
		expect(
			getForm(document.getElementById('form-test'))
		).toEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
			"checkbox-test": true,
      // eslint-disable-next-line @typescript-eslint/naming-convention
			"input-test": "Lorem Ipsum",
      // eslint-disable-next-line @typescript-eslint/naming-convention
			"radio-test": "Ipsum",
      // eslint-disable-next-line @typescript-eslint/naming-convention
			"select-test": "dolor",
      // eslint-disable-next-line @typescript-eslint/naming-convention
			"textarea-test": "elit sed do",
		});
	});

});
