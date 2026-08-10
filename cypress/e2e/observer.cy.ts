import { activateIntersection, activateIntersectionOnce, setIntersection } from '../../src';

// https://developer.mozilla.org/en-US/play
describe('Intersection, lazyload and addEvent', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/observer.html')
    cy.scrollTo('top');
    // wait that the first element is correctly lazyloaded
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);
  });

  // A 200px intersection band in the middle of the viewport (root: null) has to
  // be looked at by hand: open cypress/public/observer.html directly in a
  // browser. There is no assertion to make here from inside Cypress.

  /**
   * The fixture puts its targets at document offsets 600, 1200 and 1800, each
   * 100px tall, on a 660px viewport.
   *
   * A negative rootMargin shrinks the band the observer treats as visible:
   * -200px top and bottom leaves 660 - 400 = 260px, spanning [scroll + 200,
   * scroll + 460]. The scroll positions below sit each target squarely inside
   * or outside that band rather than on its edge, so the result does not turn
   * on a rounding decision.
   */
  it('Custom marginRoot', () => {
    cy.document()
      .then(() => {
        cy.get('.target')
          .then($elements => {
            // @ts-expect-error HTML typescript chaos. It still works anyway.
            setIntersection($elements.toArray(), {
              rootMargin: '-200px 0px',
              intersectingCallback: function (entry) {
                entry.classList.add("observed");
              },
              notIntersectingCallback: function (entry) {
                entry.classList.remove("observed");
              }
            });

            cy.get('.target')
              .first()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed');

            // band [520, 780] contains target 1 (600-700) with 80px to spare
            cy.scrollTo(0, 320);

            cy.get('.target')
              .first()
              .should('have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed');

            // band [1720, 1980] contains target 3 (1800-1900) with 80px to spare
            cy.scrollTo(0, 1520);

            cy.get('.target')
              .first()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('have.class', 'observed');

          });
      });
  });

  it('Custom element as root (the root become like the viewport)', () => {
    cy.document()
      .then($document => {

        cy.get('.target')
          .then($elements => {
            // @ts-expect-error HTML typescript chaos. It still works anyway.
            setIntersection($elements.toArray(), {
              root: $document.getElementById("scroll-area"),
              threshold: 1,
              intersectingCallback: function (entry) {
                entry.classList.add("observed");
              },
              notIntersectingCallback: function (entry) {
                entry.classList.remove("observed");
              }
            });

            // area is at the bottom of document
            cy.get('#scroll-area').scrollIntoView();

            cy.get('#scroll-area .target')
              .first()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed');

            // the following tests are the same as the previous one, but with another viewport
            cy.get('#scroll-area').scrollTo(0, 300);

            cy.get('#scroll-area .target')
              .first()
              .should('have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed');

            cy.get('#scroll-area').scrollTo(0, 1500);

            cy.get('#scroll-area .target')
              .first()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('have.class', 'observed');

          });
      });
  });

  it('fast observer with only "active class on intersection" using activateIntersection function', () => {
    cy.document()
      .then($document => {

        activateIntersection($document.querySelectorAll('.target'), "observed");

        cy.get('.target')
          .first()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        cy.scrollTo(0, 300);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        cy.scrollTo(0, 1500);

        cy.get('.target')
          .first()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('have.class', 'observed');

        cy.scrollTo(0, 300);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');
      });
  });

  /**
   * Targets sit at document offsets 600, 1200 and 1800 on a 660px viewport, and
   * the default threshold of 1 needs the whole element on screen.
   *
   * Target 2 is only ever fully visible between scroll 640 and 1200, so the
   * walk stops at 900 rather than jumping straight from 300 to 1500. Jumping
   * leaves target 2 fully visible only part-way through the animation, where
   * whether the observer samples it is a matter of how the frames land.
   */
  it('fast only once observer with only "active class on intersection" using activateIntersectionOnce function', () => {
    cy.document()
      .then($document => {

        activateIntersectionOnce($document.querySelectorAll('.target'), "observed");

        cy.get('.target')
          .first()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        // viewport [300, 960] fully contains target 1 (600-700)
        cy.scrollTo(0, 300);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        // viewport [900, 1560] fully contains target 2 (1200-1300)
        cy.scrollTo(0, 900);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        // viewport [1500, 2160] fully contains target 3 (1800-1900)
        cy.scrollTo(0, 1500);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed');

        // scrolling back leaves every one of them active: that is what "once" means
        cy.scrollTo(0, 300);

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed');
      });
  });
})
