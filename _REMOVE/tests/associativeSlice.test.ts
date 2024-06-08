import { associativeSlice } from '../index';

describe("(associativeSlice) like array.slice() but with associative arrays (objects)", () => {
	test("Generic object / associative array", () => {
		expect(
			associativeSlice({
				lorem: 'ipsum',
				adipiscing: [
					'elit',
					'sed do',
					'eiusmod'
				],
				dolor: {
					sit: 'consectetur'
				},
				elit: 'sed do',
				sit: 'consectetur',
			}, 2, 4)
		).toEqual({
			dolor: {
				sit: 'consectetur'
			},
			elit: 'sed do',
		});
	});
});
