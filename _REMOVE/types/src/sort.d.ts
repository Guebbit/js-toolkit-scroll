/**
 * 0 = neutral
 * 1 = descending
 * 2 = ascending
 */
export type ISortParameterOrderType = 0 | 1 | 2;
/**
 * Parameter to use for sorting
 * Sort order
 */
export type ISortParameterType = [string, ISortParameterOrderType];
/**
 * Single check
 * Make "FALSE" Boolean valid?
 *
 * @param {*} item1
 * @param {*} item2
 * @param {number} order
 */
export declare function check(item1: unknown, item2: unknown, order?: ISortParameterOrderType): number;
/**
 *
 * @param {Object[]} haystack
 * @param {[string, number][]} parameters
 */
declare const _default: (haystack: Array<Record<string, unknown>>, parameters?: ISortParameterType[]) => Record<string, unknown>[];
export default _default;
//# sourceMappingURL=sort.d.ts.map