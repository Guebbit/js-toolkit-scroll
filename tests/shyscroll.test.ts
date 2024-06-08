import { stickyJs } from '../../../src';

describe("(stickyJs) standard mobile header that show or hides based on the user scroll", () => {
	test("MANUAL CHECK via 'npm run serve', use /index.html and /tests/index.ts", () => {
		expect(stickyJs).toBeTruthy();
	});
});
