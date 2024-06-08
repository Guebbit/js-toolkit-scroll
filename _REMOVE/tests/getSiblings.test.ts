import { getSiblings, appendChildren } from '../index';

document.body.innerHTML =
	'<div>'+
		'<span>Lorem</span>'+
		'<span id="testSpan">Ipsum</span>'+
		'<span>Sit</span>'+
		'<span>Dolor</span>'+
	'</div>';

describe("(getSiblings) get siblings of element", () => {
	test("Input", () => {
		const wrapper = document.createElement('div');
		expect(
			appendChildren(wrapper, ...getSiblings(document.getElementById('testSpan'))).innerHTML
		).toEqual('<span>Lorem</span><span>Sit</span><span>Dolor</span>')
	});

});
