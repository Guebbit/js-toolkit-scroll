/**
 * Divide array in equals sub arrays
 *
 * @param {array} array - array to split
 * @param {number} n - number of chunks (sub arrays)
 */
export default <T>(array: T[], n = 0): T[][] => {
  const items: T[] = Object.assign([], array);
  return new Array(Math.ceil(items.length / n)).fill([]).map(() => items.splice(0, n));
}
