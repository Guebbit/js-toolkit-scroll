import { toFormData } from '../index';


describe("(toFormData) transform object in FormData", () => {
	test("Regular Object", () => {
		expect(
			toFormData({
				lorem: 'ipsum',
				adipiscing: [
					'elit',
					'sed do',
					'eiusmod'
				],
				// WARNING
				dolor: {
					sit: 'consectetur'
				}
			})
		).toBeTruthy();	//TODO how to check?
	});
});
