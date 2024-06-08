import { whitelist } from '../index';

describe("(whitelist) Filter object by array of allowed values", () => {
	test("I filter out every key-value pair except 'id' and 'param1'", () => {
		expect(
			whitelist({
				id: 3,
				param1: 'adipiscing',
				param2: 'elit sed do',
				param3: 'eiusmod'
			}, [
				'id',
				'param1',
			])
		).toEqual({
			id: 3,
			param1: 'adipiscing',
		});
	});

});
