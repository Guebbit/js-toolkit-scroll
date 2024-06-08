import { setLazyload } from '../index';

describe("(intersectionHelper) helper to automate Observer intersecate detection (when something is on screen most of the time)", () => {
  test("MANUAL CHECK via 'npm run serve', use /index.html and /tests/index.ts", () => {
    expect(setLazyload).toBeTruthy();
  });
});

// /**
//  * TODO REDO
//  * CREATED WITH CHATGPT
//  */
// import { setLazyload, setLazyloadAttributes, setLazyloadLoadVideo, setLazyloadApplyToVideo, setLazyloadApplyToImage, setLazyloadApplyToSource } from '../index';
//
// /**
//  * Mock the formatNodeList function
//  * For Isolation, Control and Simplicity reasons
//  */
// jest.mock('../src/formatNodeList', () => ({
//   // eslint-disable-next-line @typescript-eslint/naming-convention
//   __esModule: true,
//   default: (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null) => {
//     return Array.isArray(element) ? element : Array.from(element as NodeList);
//   }
// }));
//
// describe('Lazyload Functions', () => {
//   describe('setLazyloadAttributes', () => {
//     it('should update src and srcset from data-src and data-srcset and remove data attributes', () => {
//       document.body.innerHTML = `
//         <img id="img" data-src="image.jpg" data-srcset="image-2x.jpg 2x" />
//       `;
//
//       const element = document.getElementById('img') as HTMLImageElement;
//       const result = setLazyloadAttributes(element);
//
//       expect(result).toBe(true);
//       expect(element.getAttribute('src')).toBe('image.jpg');
//       expect(element.getAttribute('srcset')).toBe('image-2x.jpg 2x');
//       expect(element.hasAttribute('data-src')).toBe(false);
//       expect(element.hasAttribute('data-srcset')).toBe(false);
//     });
//
//     it('should return false if no data attributes are present', () => {
//       document.body.innerHTML = `<img id="img" src="image.jpg" />`;
//
//       const element = document.getElementById('img') as HTMLImageElement;
//       const result = setLazyloadAttributes(element);
//
//       expect(result).toBe(false);
//     });
//   });
//
//   describe('setLazyloadLoadVideo', () => {
//     it('should resolve to true when video canplaythrough event fires', async () => {
//       document.body.innerHTML = `<video id="video"><source src="video.mp4" /></video>`;
//
//       const video = document.getElementById('video') as HTMLVideoElement;
//       const canPlayThroughEvent = new Event('canplaythrough');
//
//       setTimeout(() => video.dispatchEvent(canPlayThroughEvent), 1000);
//
//       const result = await setLazyloadLoadVideo(video);
//       expect(result).toBe(true);
//       expect(video.classList.contains('loaded')).toBe(true);
//     });
//
//     it('should resolve to false when timeout occurs before canplaythrough event', async () => {
//       document.body.innerHTML = `<video id="video"><source src="video.mp4" /></video>`;
//
//       const video = document.getElementById('video') as HTMLVideoElement;
//
//       const result = await setLazyloadLoadVideo(video);
//       expect(result).toBe(false);
//     });
//   });
//
//   describe('setLazyloadApplyToVideo', () => {
//     it('should set lazyload attributes and load video', () => {
//       document.body.innerHTML = `
//         <video id="video">
//           <source data-src="video.mp4" />
//         </video>
//       `;
//
//       const video = document.getElementById('video') as HTMLVideoElement;
//       const result = setLazyloadApplyToVideo(video);
//
//       expect(result).toBe(true);
//       expect(video.querySelector('source')?.getAttribute('src')).toBe('video.mp4');
//     });
//   });
//
//   describe('setLazyloadApplyToImage', () => {
//     it('should set lazyload attributes and add loaded class onload', () => {
//       document.body.innerHTML = `<img id="img" data-src="image.jpg" />`;
//
//       const element = document.getElementById('img') as HTMLImageElement;
//       const result = setLazyloadApplyToImage(element);
//
//       expect(result).toBe(true);
//       element.onload?.({} as Event);
//       expect(element.classList.contains('loaded')).toBe(true);
//     });
//   });
//
//   describe('setLazyloadApplyToSource', () => {
//     it('should set lazyload attributes and add loaded class to parent img onload', () => {
//       document.body.innerHTML = `
//         <picture>
//           <source id="source" data-srcset="image-2x.jpg 2x" />
//           <img src="image.jpg" />
//         </picture>
//       `;
//
//       const element = document.getElementById('source') as HTMLSourceElement;
//       const result = setLazyloadApplyToSource(element);
//
//       expect(result).toBe(true);
//       element.parentNode?.querySelector('img')?.onload?.({} as Event);
//       expect(element.parentNode?.querySelector('img')?.classList.contains('loaded')).toBe(true);
//     });
//   });
//
//   describe('setLazyload', () => {
//     it('should apply lazyload to all matching elements', () => {
//       document.body.innerHTML = `
//         <div>
//           <img id="img1" data-src="image1.jpg" />
//           <img id="img2" data-src="image2.jpg" />
//           <video id="video">
//             <source data-src="video.mp4" />
//           </video>
//         </div>
//       `;
//
//       const elements = document.querySelectorAll('img, video');
//       setLazyload(elements);
//
//       const img1 = document.getElementById('img1') as HTMLImageElement;
//       const img2 = document.getElementById('img2') as HTMLImageElement;
//       const video = document.getElementById('video') as HTMLVideoElement;
//
//       expect(img1.getAttribute('src')).toBe('image1.jpg');
//       expect(img2.getAttribute('src')).toBe('image2.jpg');
//       expect(video.querySelector('source')?.getAttribute('src')).toBe('video.mp4');
//     });
//   });
// });
