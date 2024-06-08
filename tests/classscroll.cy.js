import {classScroll} from '../../src';

// https://docs.cypress.io/guides/getting-started/writing-your-first-test?utm_source=Test%20Runner&utm_medium=New%20Project%20Banner&utm_campaign=How%20To#Step-3-Click-an-element

describe('Test classScroll', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/classscroll.html')
  })

  it('Check change classes with scroll', () => {
    cy.window()
      .then($window => {
        cy.get('#class-scroll-test')
          .then($element => {
            classScroll($element[0], [
              // at 200px add the .red class, wich gives background:red
              {
                class: "white-text",
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

        cy.get('#class-scroll-test')
          .should('have.class', 'red');
        cy.scrollTo(0, 300);
        cy.get('#class-scroll-test')
          .should('have.class', 'red white-text');
        cy.scrollTo(0, 500);
        cy.get('#class-scroll-test')
          .should('not.have.class', 'red');
      });
  });
})
