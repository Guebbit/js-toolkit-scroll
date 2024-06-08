import { sort, arrayColumns } from '../index';

const input = [
  {
    id: 1,
    param1: 'lorem ipsum',
    param2: 'aaaaa',
    param3: true,
    param4: 14,
    param5: 1200,
    param6: [1,2],
    param7: 2,
  },
  {
    id: 2,
    param1: 'lorem ipsum',
    param2: 'bbbbb',
    param3: false,
    param4: 15,
    param5: 1100,
    param6: [1,2,3],
    param7: 1,
  },
  {
    id: 3,
    param1: 'adipiscing',
    param2: 'ccccc',
    param3: true,
    param4: 14,
    param5: 1300,
    param6: [1]
  },
];


describe("(sort) NUMBER sorting", () => {

  test("1 - descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param5", 1]
        ]),
        "id"
      )
    ).toEqual([
      3, 1, 2
    ]);
  });

  test("1 - ascending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param5", 2]
        ]),
        "id"
      )
    ).toEqual([
      2, 1, 3
    ]);
  });

  test("2 - descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param4", 1],
          ["param5", 1]
        ]),
        "id"
      )
    ).toEqual([
      2, 3, 1
    ]);
  });

  test("2 - 1 ascending and the 1 descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param4", 2],
          ["param5", 1]
        ]),
        "id"
      )
    ).toEqual([
      3, 1, 2
    ]);
  });
});

describe("(sort) BOOLEAN sorting (FALSE problem, is a falsy value and it's treated as undefined or null)", () => {

  test("1 - descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param3", 1]
        ]),
        "id"
      )
    ).toEqual([
      1, 3, 2
    ]);
  });

  test("1 - ascending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param3", 2]
        ]),
        "id"
      )
    ).toEqual([
      1, 3, 2
    ]);
  });
});

describe("(sort) STRING sorting", () => {
  test("1 - descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param2", 1]
        ]),
        "id"
      )
    ).toEqual([
      3, 2, 1
    ]);
  });

  test("2 - descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param1", 1],
          ["param2", 1]
        ]),
        "id"
      )
    ).toEqual([
      2, 1, 3
    ]);
  });
});

describe("(sort) SPECIAL sorting", () => {

  test("1 - array (length)", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param6", 1]
        ]),
        "id"
      )
    ).toEqual([
      2, 1, 3
    ]);
  });

  test("1 - missing parameter ascending", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param7", 2]
        ]),
        "id"
      )
    ).toEqual([
      2, 1, 3
    ]);
  });

  test("1 - missing parameter descending", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param7", 1]
        ]),
        "id"
      )
    ).toEqual([
      1, 2, 3
    ]);
  });

});

describe("(sort) MIXED sorting", () => {

  test("2 - STRING and NUMBER descending order", () => {
    expect(
      arrayColumns(
        sort(input, [
          ["param1", 1],
          ["param5", 1]
        ]),
        "id"
      )
    ).toEqual([
      1, 2, 3
    ]);
  });

});
