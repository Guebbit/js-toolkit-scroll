import { getOverlapRange } from '../index';

describe("(getOverlapRange) check if 2 range overlap then return the START and END period of the overlap", () => {
  test("Same time", () => {
    expect(
      getOverlapRange(50, 100, 50, 100),
    ).toEqual([50, 100]);
  });

  test("No intersection", () => {
    expect(
      getOverlapRange(50, 100, 150, 200),
    ).toEqual([0, 0]);
  });

  test("No intersection (same number, same unit DO overlap)", () => {
    expect(
      getOverlapRange(50, 100, 100, 200),
    ).toEqual([0, 0]);
  });

  test("A starts in B  || B ends in A", () => {
    expect(
      getOverlapRange(150, 300, 100, 200),
    ).toEqual([150, 200]);
  });

  test("A ends in B || B starts in A", () => {
    expect(
      getOverlapRange(50, 100, 80, 200),
    ).toEqual([80, 100]);
  });

  test("A in B", () => {
    expect(
      getOverlapRange(50, 100, 10, 200),
    ).toEqual([50, 100]);
  });

  test("B in A", () => {
    expect(
      getOverlapRange(50, 100, 70, 80),
    ).toEqual([70, 80]);
  });
});
