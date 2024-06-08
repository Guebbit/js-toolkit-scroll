import { getMapDistance } from '../index';


describe("(getMapDistance) Distance between 2 points, like coordinates on a map A(x,y) & B(x,y)", () => {
  test("distance between 40|70 and 50|50 on a 400 map", () => {
    expect(
      getMapDistance(40, 50, 70, 50, 400).toFixed(2)
    ).toEqual('417.73');
  });
});
