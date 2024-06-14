import mouseParallax, { executeMouseParallax } from '../../src/index';

describe('Test mouseParallax (visual test only)', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8080/random.html');
  });

  it('Custom use', () => {
    cy.document()
      .then($document => {
        cy.get('#parallax-object > *')
          .then($elements => {
            const parallaxObject = mouseParallax($elements.toArray(), null, $document);
            // single movement, like if the mouse were on 800x and 400y coordinates
            if(!parallaxObject)
              return;
            executeMouseParallax(parallaxObject, 800, 400)
            //after 1 second, another movement
            setTimeout(() => executeMouseParallax(parallaxObject, 1200, 800), 1000)
          });
      });
  });

  it('Random Objects', () => {
    cy.document()
      .then($document => {
        cy.get('#parallax-object > *')
          .then($elements => {
            const parallaxObject = mouseParallax($elements.toArray(), null, $document);
            if(!parallaxObject)
              return;
            parallaxObject.build();
            const { items = [] } = parallaxObject;
            // stop "low" text to move on Y axis
            items[2].intensityY = 0;
          });
      });
  });
})
