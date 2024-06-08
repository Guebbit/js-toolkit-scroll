import { isHex } from '../';

describe("(isObject) check if object", () => {
  test("3 with hash", () => {
    expect(
      isHex('#000000')
    ).toBeTruthy();
  });
  test("6 with hash", () => {
    expect(
      isHex('#FFF')
    ).toBeTruthy();
  });
  test("3 without hash", () => {
    expect(
      isHex('000000')
    ).toBeTruthy();
  });
  test("6 without hash", () => {
    expect(
      isHex('FFF')
    ).toBeTruthy();
  });
});
