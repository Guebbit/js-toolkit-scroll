import { getUuid } from '../index';

describe("(getUuid) random v4 UUID (gxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)", () => {
	test("Regular Object", () => {
		expect(getUuid()).toMatch(new RegExp(/^g[0-9A-F]{7}-[0-9A-F]{4}-4[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i));
	});
});
