/**
 *  Transpose a matrix. Invert rows and columns
 *   [1,2,3],      [1,1,1],
 *   [1,2,3], =>   [2,2,2],
 *   [1,2,3],      [3,3,3],
 * @param m
 */
export default <T>(m: Array<Array<T | undefined>>) :Array<Array<T | undefined>> => {
	if(m.length < 1 || !m[0])
		return [];
	return m[0].map((_x,i) => m.map(x => x[i]))
}
