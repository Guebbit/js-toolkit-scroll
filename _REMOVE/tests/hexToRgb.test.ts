import { hexToRgb } from '../index';

describe("(secondsToTime) Transform a milliseconds integer in an object with all possible time variations", () => {
  test("Black", () => {
    expect(
      hexToRgb('#000000')
    ).toEqual([0, 0, 0]);
  });

  test("Blue", () => {
    expect(
      hexToRgb('#0086ff')
    ).toEqual([0, 134, 255]);
  });
});
