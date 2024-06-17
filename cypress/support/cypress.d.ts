declare namespace Cypress {
  interface Chainable {
    addImages(containerSelector: string, parallaxImages?: Array<{ src: string, [key: string]: string | number }>): Chainable<HTMLElement[]>;
  }
}
