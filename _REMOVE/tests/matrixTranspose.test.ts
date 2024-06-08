import { matrixTranspose } from '../index';


describe("(matrixTranspose) Transpose a matrix. Invert rows and columns", () => {
	test("default", () => {
		expect(
			matrixTranspose([
				[1,2,3],
				[1,2,3],
				[1,2,3]
			])
		).toEqual([
			[1,1,1],
			[2,2,2],
			[3,3,3]
		]);
	});
});
