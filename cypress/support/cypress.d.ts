declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<Element>;
    addImages(containerSelector: string, parallaxImages?: Array<{ src: string, [key: string]: string | number }>): Chainable<HTMLElement[]>;
  }
}
