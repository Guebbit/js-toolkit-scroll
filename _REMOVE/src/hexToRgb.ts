/**
 * transform HEX #000 to RGB [0,0,0]
 *
 * @param {string} hex
 */
export default (hex: string) :[number, number, number] => {
  // if null or undefined, return black
  if (!hex) {
    return [0, 0, 0]
  }
  // remove #
  if (hex[0] === "#") {
    hex = hex.substring(1);
  }
  // if shorthand, standardize
  if (hex.length === 3) {
    hex = (hex[0] || '0') + (hex[0] || '0') + (hex[1] || '0') + (hex[1] || '0') + (hex[2] || '0') + (hex[2] || '0');
  }
  // if not valid, throw error
  if (hex.length !== 6) {
    throw "Only six-digit hex colors are allowed.";
  }
  // transform in hex
  const [r = '00', g = '00', b = '00'] = hex.match(/.{1,2}/g)!;
  // base decimal
  return [
    parseInt(r, 16),
    parseInt(g, 16),
    parseInt(b, 16)
  ];
}
