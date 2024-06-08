import { getDelta } from '../index';


describe("(getDelta) Math delta", () => {
	test("default", () => {
    expect(
      getDelta(40, 70, 400)
    ).toEqual(-30);
	});
});
