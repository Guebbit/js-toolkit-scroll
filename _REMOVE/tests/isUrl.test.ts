import { isUrl } from '../';

describe("(isObject) check if object", () => {
	test("Empty string", () => {
		expect(
			isUrl('')
		).toBeFalsy();
	});
	test("Some string", () => {
		expect(
			isUrl('lorem ipsum')
		).toBeFalsy();
	});

	test("Email", () => {
		expect(
			isUrl('lorem@ipsum.it')
		).toBeFalsy();
	});
	test("Url but not quite 1 (return true)", () => {
		expect(
			isUrl('lorem.ipsum')
		).toBeTruthy();
	});
	test("Url but not quite 2 (return false)", () => {
		expect(
			isUrl('lorem.ipsum:')
		).toBeFalsy();
	});
	test("Real URL", () => {
		expect(
			isUrl('https://lodash.com/')
		).toBeTruthy();
	});
});
