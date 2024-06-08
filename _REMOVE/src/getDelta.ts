/**
 * Math delta
 *
 * @param {number} a
 * @param {number} b
 * @param {number} size
 */
export default (a :number, b :number, size = 0) =>
  Math.min(size - (a - b), (a - b));
