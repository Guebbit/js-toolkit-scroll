import { secondsToTime } from '../index';

describe("(secondsToTime) Transform a milliseconds integer in an object with all possible time variations", () => {
	test("12 hours and 30 minutes", () => {
    expect(
      secondsToTime(45000000)
    ).toEqual({
      years: 0,
      yearsOnly: 0,
      months: 0,
      monthsOnly: 0,
      weeks: 0,
      weeksOnly: 0,
      days: 0,
      daysOnly: 0,
      hours: 12,
      hoursOnly: 12,
      minutes: 30,
      minutesOnly: 750,
      seconds: 0,
      secondsOnly: 45000,
      milliseconds: 0,
      millisecondsOnly: 45000000
    });
	});

  test("timestamp", () => {
    expect(
      secondsToTime(1651440376000)
    ).toEqual({
      years: 52,
      yearsOnly: 52,
      months: 4,
      monthsOnly: 637,
      weeks: 1,
      weeksOnly: 2730,
      days: 6,
      daysOnly: 19113,
      hours: 21,
      hoursOnly: 458733,
      minutes: 26,
      minutesOnly: 27524006,
      seconds: 16,
      secondsOnly: 1651440376,
      milliseconds: 0,
      millisecondsOnly: 1651440376000
    });
  })


});
