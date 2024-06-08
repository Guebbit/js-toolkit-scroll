import { getIframe } from '../index';

document.body.innerHTML =
	'<iframe id="iframe-test">'+
		'<div>Lorem</div>'+
		'<div>Ipsum</div>'+
	'</iframe>';

describe("(getIframe) Get Iframe content", () => {

	test(" - ", () => {
		expect(
			getIframe(document.getElementById('iframe-test'))!.tagName
		).toEqual('BODY')
	});

});
