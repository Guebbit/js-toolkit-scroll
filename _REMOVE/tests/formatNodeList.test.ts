/**
 * TODO REDO
 * CREATED WITH CHATGPT
 */
import { formatNodeList } from '../index';

describe("formatNodeList", () => {
  test("should return an empty array when given null", () => {
    expect(formatNodeList(null)).toEqual([]);
  });

  test("should convert a single HTMLElement to an array", () => {
    const element = document.createElement('div');
    expect(formatNodeList(element)).toEqual([element]);
  });

  // TODO
  // test("should return the same array when given an array of HTMLElements", () => {
  //   const element1 = document.createElement('div');
  //   const element2 = document.createElement('span');
  //   const array = [element1, element2];
  //   expect(formatNodeList(array)).toBe(array);
  // });

  test("should convert a NodeList to an array", () => {
    document.body.innerHTML = '<div></div><span></span>';
    const nodeList = document.querySelectorAll('div, span');
    expect(formatNodeList(nodeList)).toEqual(Array.from(nodeList));
  });


  // TODO
  // test("should convert an HTMLCollection to an array", () => {
  //   document.body.innerHTML = '<div></div><span></span>';
  //   const htmlCollection = document.getElementsByTagName('div');
  //   expect(formatNodeList(htmlCollection)).toEqual(Array.from(htmlCollection));
  // });
});
