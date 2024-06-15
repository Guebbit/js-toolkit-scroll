import { intersectionHelper, lazyloadHelper, scripts } from '../../src';

describe('Test images lazyloading TODO $window problem', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/lazyloadhelper.html')
  });

  it('lazyload & activator TODO not work', () => {
    cy.document()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then($document => {
        scripts.lazyload();
        scripts.activator();
        // cy.scrollTo(0, 400);
        // cy.scrollTo('bottom');
      });
  });

  it('Lazyload TODO (patch cypress, remove $window need)', () => {
    // @TODO remove "lazyload-me" needed on picture\video sources
    cy.get('[data-src]:not(.lazyload-forced), [data-srcset]:not(.lazyload-forced), .lazyload-me')
      .then($elements => {
        intersectionHelper($elements.toArray(), {
          rootMargin: '0px 0px',	// 500px 0px per il lazyload serio
          single: true,			// lazyload è one-hit quindi fermo l'observer specifico di questa immagine appena ha fatto
          threshold: 1,			// 0 (default) in lazyload serio
          intersectingCallback: function (entry) {
            console.log('ENTRY:', entry)
            return lazyloadHelper(entry);
          }
        });
      });
  });
})
