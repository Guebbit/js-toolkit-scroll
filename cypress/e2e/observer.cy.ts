import {intersectionHelper} from '../../src';

describe('Intersection, lazyload and addEvent', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/intersectionhelper.html')
  });

  it('Intersection TODO, non "vede" la window (patch cypress, remove $window need)', () => {
    cy.window()
      .then($window => {
        cy.get('section')
          .then($elements => {
            intersectionHelper($elements.toArray(), {
              rootMargin: '-300px 0px',
              threshold: 1,
              intersectingCallback: function (entry) {
                entry.classList.add("in-the-middle");
                return true;
              },
              notIntersectingCallback: function (entry) {
                entry.classList.remove("in-the-middle");
                return true;
              }
            }, $window);
          });
      });

    cy.get('section')
      .first()
        .should('have.class', 'in-the-middle')
      .next()
        .should('not.have.class', 'in-the-middle')
      .next()
        .should('not.have.class', 'in-the-middle');

    cy.scrollTo(0, 200);

    cy.get('section')
      .first()
      .should('not.have.class', 'in-the-middle')
      .next()
      .should('not.have.class', 'in-the-middle')
      .next()
      .should('not.have.class', 'in-the-middle');

    cy.scrollTo(0, 400);

    cy.get('section')
      .first()
      .should('not.have.class', 'in-the-middle')
      .next()
      .should('have.class', 'in-the-middle')
      .next()
      .should('not.have.class', 'in-the-middle');

    cy.scrollTo('bottom');

    cy.get('section')
      .first()
      .should('not.have.class', 'in-the-middle')
      .next()
      .should('not.have.class', 'in-the-middle')
      .next()
      .should('have.class', 'in-the-middle');
  });
})
