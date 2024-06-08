import { isEmail } from '../';

describe("(isEmail) check if valid E-Mail", () => {
	test("Empty string", () => {
		expect(
			isEmail('')
		).toBeFalsy();
	});
	test("Some string", () => {
		expect(
			isEmail('lorem ipsum')
		).toBeFalsy();
	});

	test("Email but not quite 1", () => {
		expect(
			isEmail('lorem.ipsum')
		).toBeFalsy();
	});
	test("Email but not quite 2", () => {
		expect(
			isEmail('lorem@ipsum')
		).toBeFalsy();
	});

	test("Real Email", () => {
		expect(
			isEmail('lorem@ipsum.it')
		).toBeTruthy();
	});
});
