import { activateIntersection, activateIntersectionOnce, setIntersection } from '../../src';

// https://developer.mozilla.org/en-US/play
describe('Intersection, lazyload and addEvent', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/observer.html')
    cy.scrollTo('top');
    cy.wait(200);
  });

  it('Custom intersection of 200px in the middle of viewport (root: null) - WARNING: use observer.html without cypress', () => {});

  it('Custom marginRoot', () => {
    cy.document()
      .then(() => {
        cy.get('.target')
          .then($elements => {
            setIntersection($elements.toArray(), {
              rootMargin: '-400px 0px',
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

            cy.scrollTo(0, 300, { duration: 100 });

            cy.get('.target')
              .first()
              .should('have.class', 'observed')
              .next()
              .should('not.have.class', 'observed')
              .next()
              .should('not.have.class', 'observed');

            cy.scrollTo(0, 1500, { duration: 100 });

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

        cy.scrollTo(0, 300, { duration: 100 });

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        cy.scrollTo(0, 1500, { duration: 100 });

        cy.get('.target')
          .first()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('have.class', 'observed');

        cy.scrollTo(0, 300, { duration: 100 });

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');
      });
  });

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

        cy.scrollTo(0, 300, { duration: 100 });

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('not.have.class', 'observed')
          .next()
          .should('not.have.class', 'observed');

        cy.scrollTo(0, 1500, { duration: 100 });

        cy.get('.target')
          .first()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed')
          .next()
          .should('have.class', 'observed');

        cy.scrollTo(0, 300, { duration: 100 });

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
