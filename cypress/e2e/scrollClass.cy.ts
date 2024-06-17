import { scrollClass } from '../../src';

describe('Test scrollClass', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/header.html')
  })

  it('Check change classes with scroll', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            scrollClass($element[0], [
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
})
