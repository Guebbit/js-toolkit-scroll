import {scrollclass} from '../../src';

// https://docs.cypress.io/guides/getting-started/writing-your-first-test?utm_source=Test%20Runner&utm_medium=New%20Project%20Banner&utm_campaign=How%20To#Step-3-Click-an-element

describe('Test scrollclass', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/scrollclass.html')
  })

  it('Check change classes with scroll', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            scrollclass($element[0], [
              // at 200px add the .red class, wich gives background:red
              {
                class: "active-test",
                scroll: 200,
              },
              // at 400px, I remove it
              {
                class: "red",
                scroll: 400,
                remove: true
              }
            ], $window)
          });

        cy.get('#header-test')
          .should('have.class', 'red');
        cy.scrollTo(0, 300);
        cy.get('#header-test')
          .should('have.class', 'red active-test');
        cy.scrollTo(0, 500);
        cy.get('#header-test')
          .should('not.have.class', 'red');
      });
  });
})
