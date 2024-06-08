/**
 * Check if 2 ranges overlap,
 * then return the START and END period of the overlap
 *
 * WARNING: If B start right after A and have the same number, it will NOT be counted as overlap TODO create mode?
 *
 * https://www.get-digital-help.com/days-contained-in-a-range-that-overlap-another-range/
 * https://www.codeproject.com/Articles/168662/Time-Period-Library-for-NET
 *
 * @param {number} firstStart  - A1
 * @param {number} firstEnd    - A2
 * @param {number} secondStart - B1
 * @param {number} secondEnd   - B2
 * @return {number}
 */
export default (firstStart :number, firstEnd :number, secondStart :number, secondEnd :number) :[number, number] => {
  // First EQUAL Second
  if(firstStart === secondStart && firstEnd === secondEnd)
    return [firstStart, firstEnd]

  // First IN Second
  if(secondStart < firstStart && firstEnd < secondEnd)
    return [firstStart, firstEnd];

  // Second IN First
  if(firstStart < secondStart && secondEnd < firstEnd)
    return [secondStart, secondEnd];

  // Second starts in First
  if(firstStart < secondStart && secondStart < firstEnd)
    return [secondStart,firstEnd];

  // Second ends in First
  if(firstStart < secondEnd && secondEnd < firstEnd)
    return [firstStart,secondEnd];

  // NO overlapping
  return [0,0];
}
