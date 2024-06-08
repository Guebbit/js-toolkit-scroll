import arrayDivide from './arrayDivide';

/**
 * Divide array in N numbers of sub-arrays.
 * Sub-arrays' lengths differ as less as possible
 *
 * @param {array} array - array to split
 * @param {number} n - number of chunks
 */
export default <T>(array: T[], n: number) :T[][] => {
  const items = Object.assign([] as T[], array),
    len = items.length,
    output: T[][] = [];
  let i = 0;

  if (n < 1)
    return [];
  if (n < 2)
    return [items];
  if (len % n === 0)
    return arrayDivide(items, Math.floor(len / n));

  while (i < len)
    output.push(
      items.slice(i, i += Math.ceil((len - i) / n--))
    );
  return output;
}
