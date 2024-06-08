import { getJson } from '../index';

describe("(getJson) Safe conversion of JSON", () => {

  test("Empty", () => {
    expect(
      getJson()
    ).toBeFalsy()
  });

  test("Random string", () => {
    expect(
      getJson("12345")
    ).toBe(12345)
  });

  test("Empty object (json)", () => {
    expect(
      getJson("{}")
    ).toBeTruthy()
  });

  test("Empty array (json)", () => {
    expect(
      getJson("[]")
    ).toBeTruthy()
  });

  test("Wrong object (json)", () => {
    expect(
      getJson("{ 'test': 'toast' }")
    ).toBeFalsy()
  });

  test("Wrong array (json)", () => {
    expect(
      getJson("['bim', 'bum', 'bam']")
    ).toBeFalsy()
  });

  test("Correct object (json)", () => {
    expect(
      getJson("{\"test\":\"toast\",\"lorem\":\"ipsum\"}")
    ).toBeTruthy()
  });

  test("Correct array (json)", () => {
    expect(
      getJson("[\"bim\",\"bum\",\"bam\"]")
    ).toBeTruthy()
  });
});
