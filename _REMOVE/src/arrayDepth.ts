/**
 * Get array depth
 *
 * @param {*} check
 */
function arrayDepth<T>(check: T | T[]) :number {
  return Array.isArray(check) ?
    1 + Math.max(0, ...check.map(arrayDepth)) :
    0;
}

export default arrayDepth;
