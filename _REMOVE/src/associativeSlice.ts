/**
 * Slices an associative array (object) to only include properties between specified start and end indices,
 * similar to how `Array.prototype.slice` works for arrays.
 *
 * @param obj
 * @param start - start of slice
 * @param end - end of slice
 * @return object sliced associative array / object to slice
 */
export default (obj :Record<string, unknown>, start :number, end :number) :Record<string, unknown> => {
	const sliced :Record<string, unknown> = {};
	let i = 0;
	for (const k in obj) {
		if(Object.prototype.hasOwnProperty.call(obj, k)){
			if (i >= start && i < end){
				sliced[k] = obj[k];
			}
			i++;
		}
	}
	return sliced;
}
