import { isJson } from '../';

describe("(isJson) check if JSON is valid", () => {
	test("Empty string", () => {
		expect(
			isJson('')
		).toBeFalsy();
	});
	test("Empty JSON array", () => {
		expect(
			isJson('[]')
		).toBeTruthy();
	});
	test("Empty JSON object", () => {
		expect(
			isJson('{}')
		).toBeTruthy();
	});
	test("Empty JSON array", () => {
		expect(
			isJson('["lorem", "ipsum"]')
		).toBeTruthy();
	});
	test("Empty JSON object", () => {
		expect(
			isJson('{"lorem": "ipsum"}')
		).toBeTruthy();
	});
});
