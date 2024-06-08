/**
 * Check if 2 ranges overlap,
 * then return the number of overlapping units
 *
 * WARNING: If B start right after A and have the same number, it will say that they overlap of "1"
 * In some cases is better to ignore this 1 unit of overlap
 * (example, in dates it would be 1 second of overlap)
 *
 * @param {number} firstStart  - A1
 * @param {number} firstEnd    - A2
 * @param {number} secondStart - B1
 * @param {number} secondEnd   - B2
 * @param {number} sameUnitOverlap - same unit is or isn't overlap
 * @return {number}
 */
export default (firstStart :number, firstEnd :number, secondStart :number, secondEnd :number, sameUnitOverlap = false) :number => {
  return Math.max(Math.min(firstEnd, secondEnd) - Math.max(firstStart, secondStart) + (sameUnitOverlap ? 1 : 0), 0);
}
