import { arrayDepth } from '../';

describe("(arrayDepth) Get depth of array", () => {

  test("Non array", () => {
    expect(
      arrayDepth('lorem-ipsum')
    ).toBe(0);
  });

  test("1", () => {
    expect(
      arrayDepth(['lorem-ipsum'])
    ).toBe(1);
  });

  test("2", () => {
    expect(
      arrayDepth([['lorem-ipsum']])
    ).toBe(2);
  });

  test("3", () => {
    expect(
      arrayDepth([[['lorem-ipsum']]])
    ).toBe(3);
  });

  test("4 (complex)", () => {
    expect(
      arrayDepth([1,2,[3,4,[5,6],7,[8,[9,91]],10],11,12])
    ).toBe(4);
  });

});
