/**
 * Safe conversion of JSON
 * If not valid: return undefined
 *
 * @param {string} json
 * @return {Object?}
 */
export default (json ?:string) :unknown | undefined => {
  if(!json)
    return;
  let decoded :unknown = undefined;
  try {
    decoded = JSON.parse(json)
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return decoded;
}
