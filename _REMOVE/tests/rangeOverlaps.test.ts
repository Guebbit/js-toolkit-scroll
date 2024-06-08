import { rangeOverlaps } from '../';

describe("(rangeOverlaps) check if 2 range overlaps then return the number of overlapping units", () => {

  test("Same time", () => {
    expect(
      rangeOverlaps(50, 100, 50, 100),
    ).toBe(50);
  });

  test("No intersection", () => {
    expect(
      rangeOverlaps(50, 100, 150, 200),
    ).toBe(0);
  });

  test("No intersection (same number, same unit DO overlap)", () => {
    expect(
      rangeOverlaps(50, 100, 100, 200),
    ).toBe(0);
  });

  test("No intersection (same number, same unit DONT overlap)", () => {
    expect(
      rangeOverlaps(50, 100, 100, 200, true),
    ).toBe(1);
  });

  test("A starts in B  || B ends in A", () => {
    expect(
      rangeOverlaps(150, 300, 100, 200),
    ).toBe(50);
  });

  test("A ends in B || B starts in A", () => {
    expect(
      rangeOverlaps(50, 100, 80, 200),
    ).toBe(20);
  });


  test("A in B", () => {
    expect(
      rangeOverlaps(50, 100, 10, 200),
    ).toBe(50);
  });

  test("B in A", () => {
    expect(
      rangeOverlaps(50, 100, 70, 80),
    ).toBe(10);
  });
});
