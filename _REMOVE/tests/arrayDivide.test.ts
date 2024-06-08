import { arrayDivide } from '../';

describe("(arrayDivide) splits array in sub-arrays with MAX [num] elements", () => {
	const input :string[] = [
		'lorem',
		'ipsum',
		'dolor',
		'sit',
		'consectetur',
		'adipiscing',
		'elit',
		'sed do',
		'eiusmod'
	];

	test("2 max items", () => {
		expect(
			arrayDivide(input, 2)
		).toEqual([
			[
				'lorem',
				'ipsum',
			],
			[
				'dolor',
				'sit',
			],
			[
				'consectetur',
				'adipiscing',
			],
			[
				'elit',
				'sed do',
			],
			[
				'eiusmod'
			],
		]);
	});

	test("3 max items", () => {
		expect(
			arrayDivide(input, 3)
		).toEqual([
			[
				'lorem',
				'ipsum',
				'dolor'
			],
			[
				'sit',
				'consectetur',
				'adipiscing'
			],
			[
				'elit',
				'sed do',
				'eiusmod'
			]
		]);
	});

	test("5 max items", () => {
		expect(
			arrayDivide(input, 5)
		).toEqual([
			[
				'lorem',
				'ipsum',
				'dolor',
				'sit',
				'consectetur'
			],
			[
				'adipiscing',
				'elit',
				'sed do',
				'eiusmod'
			]
		]);
	});

	test("6 max items", () => {
		expect(
			arrayDivide(input, 6)
		).toEqual([
			[
				'lorem',
				'ipsum',
				'dolor',
				'sit',
				'consectetur',
				'adipiscing',
			],
			[
				'elit',
				'sed do',
				'eiusmod'
			]
		]);
	});

});
