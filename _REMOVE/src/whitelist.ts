/**
 * TODO da fare con tutte le funzioni possibili
 * WHITELIST
 * Filter object by array of allowed values
 *
 * @param recordsToFilter - records
 * @param allowed - allowed keys of records
 */
export default <T>(recordsToFilter: Record<string, T>, allowed: string[]) :Record<string, T> => {
	return Object.keys(recordsToFilter)
		.filter(key => allowed.includes(key))
		.reduce((obj :Record<string, T>, key) => {
			obj[key] = recordsToFilter[key] as T;
			return obj;
		}, {});
};
