import getDelta from './getDelta';

/**
 * Distance between 2 points, like coordinates on a map A(x,y) & B(x,y)
 *
 * @param {number} Xa - coordinate X of point A
 * @param {number} Xb - coordinate X of point A
 * @param {number} Ya - coordinate Y of point B
 * @param {number} Yb - coordinate Y of point B
 * @param {number} size
 */
export default (Xa :number, Xb :number, Ya :number, Yb :number, size = 0) =>
  Math.hypot(getDelta(size, Xa, Xb), getDelta(size, Ya, Yb));
