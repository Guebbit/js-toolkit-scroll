export interface ISecondsToTimeMap {
    years?: number;
    yearsOnly?: number;
    months?: number;
    monthsOnly?: number;
    weeks?: number;
    weeksOnly?: number;
    days?: number;
    daysOnly?: number;
    hours?: number;
    hoursOnly?: number;
    minutes?: number;
    minutesOnly?: number;
    seconds?: number;
    secondsOnly?: number;
    milliseconds?: number;
    millisecondsOnly?: number;
}
/**
 * Transform milliseconds in minutes/hours/days/etc
 * Return object with numerous variantions, to recombine later as one want
 *
 * @param {number} time
 * @return {Object}
 */
declare const _default: (time?: number) => ISecondsToTimeMap;
export default _default;
//# sourceMappingURL=secondsToTime.d.ts.map