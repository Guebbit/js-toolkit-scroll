import { timeToSeconds } from '../index';

describe("(timeToSeconds) Transform 'HH:MM:SS:ms' string in milliseconds integer", () => {
	test("default", () => {
		expect(
      timeToSeconds('14:30:20:50')
		).toEqual(52220050);
	});

  test("without milliseconds", () => {
    expect(
      timeToSeconds('14:30:20')
    ).toEqual(52220000);
  });

  test("minutes and hours only", () => {
    expect(
      timeToSeconds('14:30')
    ).toEqual(52200000);
  });

  test("hours only", () => {
    expect(
      timeToSeconds('14')
    ).toEqual(50400000);
  });
});
