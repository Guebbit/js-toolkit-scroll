import { setIntersection, setLazyload, activateLazyload } from '../../src';

function regularLazyloadStart(){
  cy.get('img, video, picture')
    .then($elements => {
      setIntersection($elements.get(), {
        single: true,			      // lazyload is single use
        rootMargin: '0px 0px',	// should be 500px 0px, but we want to see the change
        threshold: 1,			      // should be 0, but we want to see the change
        intersectingCallback: function (entry) {
          return setLazyload([entry]);
        }
      });
    });
}

// These tests can't work without interaction
if (Cypress.config('isInteractive')) {
  describe('Test images lazyloading', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8080/lazyload.html')
      cy.scrollTo('top');
    });

    it('Lazyload <img/>', () => {
      regularLazyloadStart();

      // only the first, already on the screen, should be lazyloaded
      cy.get('#image-list > img').each(elements =>
        cy.wrap(elements).should('have.attr', 'data-src')
      )

      // go to bottom of last image
      cy.scrollTo(0, 2000, { duration: 1000 });

      cy.get('#image-list > img').each(elements =>
        cy.wrap(elements).should('not.have.attr', 'data-src')
      )
    });

    it('Lazyload <picture>', () => {
      regularLazyloadStart();
      cy.get('picture')
        .first()
        .children()
        .each((element) => {
          switch (element.prop('tagName').toLowerCase()){
            case "img":
              cy.wrap(element).should('have.attr', 'data-src');
              break;
            case "picture":
              cy.wrap(element).should('have.attr', 'data-srcset');
              break;
          }
        });

      // scroll to element before re-checking
      cy.get('picture')
        .first()
        .scrollIntoView()
        .children()
        .each((element) => {
          switch (element.prop('tagName').toLowerCase()){
            case "img":
              cy.wrap(element).should('not.have.attr', 'data-src');
              break;
            case "picture":
              cy.wrap(element).should('not.have.attr', 'data-srcset');
              break;
          }
        });
    });

    it('Lazyload <video>', () => {
      regularLazyloadStart();

      // Check initial state before scrolling
      cy.get('video')
        .first()
        .children()
        .each((element) =>
          cy.wrap(element)
            .should('have.attr', 'data-src')
        );

      cy.get('video')
        .eq(1)
        .should('have.attr', 'data-src')

      // Scroll to element before re-checking
      cy.get('video')
        .first()
        .scrollIntoView()
        .children()
        .each((element) =>
          cy.wrap(element)
            .should('not.have.attr', 'data-src')
        );

      cy.get('video')
        .eq(1)
        .scrollIntoView()
        .should('not.have.attr', 'data-src')
    });

    it('Top to bottom, check all items', () => {
      regularLazyloadStart();

      cy.get('img')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-src')
        );

      cy.get('picture > *:not(img)')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-srcset')
        );

      cy.get('video > *, picture > img')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-src')
        );

      // wait to lazyload first image
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      // scroll to bottom
      cy.scrollTo('bottom', { duration: 2000 });

      cy.get('img')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-src')
        );

      cy.get('picture > *:not(img)')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-srcset')
        );

      cy.get('video > *, picture > img')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-src')
        );
    });

    it('activateLazyload shortcut of the previous test', () => {
      // add a forced lazyload
      cy.get('img')
        .eq(3)
        .invoke('addClass', 'lazyload-forced');

      cy.document()
        .then($document => {
          activateLazyload(
            $document.querySelectorAll('img:not(.lazyload-forced), video:not(.lazyload-forced), picture:not(.lazyload-forced)'),
            $document.querySelectorAll('.lazyload-forced')
          );
        })

      cy.get('img:not(.lazyload-forced)')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-src')
        );

      cy.get('img.lazyload-forced')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-src')
        );

      cy.get('img:not(.lazyload-forced)')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-src')
        );

      cy.get('picture > *:not(img)')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-srcset')
        );

      cy.get('video > *, picture > img')
        .each((element) =>
          cy.wrap(element).should('have.attr', 'data-src')
        );

      // wait to lazyload first image
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);
      // scroll to bottom
      cy.scrollTo('bottom', { duration: 2000 });

      cy.get('img')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-src')
        );

      cy.get('picture > *:not(img)')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-srcset')
        );

      cy.get('video > *, picture > img')
        .each((element) =>
          cy.wrap(element).should('not.have.attr', 'data-src')
        );
    });
  })
}
