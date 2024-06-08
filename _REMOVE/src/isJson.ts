/**
 * Control if parameter is json
 * @param test
 * @return json or false
 */
export default <T>(test :string) :Record<string, T> | false => {
	try {
		return JSON.parse(test);
	} catch (e) {
		return false;
	}
}
