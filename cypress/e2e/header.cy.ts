import { shyel } from '../../src/index';
import stickyel from "../../src/stickyel"

describe('Test header manipulation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/header.html');
  });

  it('stickyel alone', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            stickyel($element[0], 'i-am-sticky', $window);
          });
      });

    cy.get('#header-test')
      .should('not.have.class', 'i-am-sticky');
    cy.scrollTo(0, 300);
    cy.get('#header-test')
      .should('have.class', 'i-am-sticky')
      .should('have.css', 'position', 'fixed');
  });

  // it('shyel alone', () => {
  //   cy.window()
  //     .then($window => {
  //       cy.get('#header-test')
  //         .then($element => {
  //           // position fixed needed
  //           $element[0].style.position = 'fixed';
  //           $element[0].style.top = '0px';
  //
  //           shyel($element[0], {
  //             className: 'i-am-shy',
  //             threshold: 300,
  //             intensity: 100
  //           }, $window);
  //         });
  //     });
  //
  //   // start
  //   cy.scrollTo(0, 0);
  //   cy.get('#header-test')
  //     .should('not.have.class', 'i-am-shy');
  //   cy.scrollTo(0, 50);
  //   // threshold yet to surpass
  //   cy.get('#header-test')
  //     .should('not.have.class', 'i-am-shy');
  //   cy.scrollTo(0, 300);
  //   // threshold surpassed, and lastScroll start from 0 so intensity pass
  //   cy.get('#header-test')
  //     .should('have.class', 'i-am-shy');
  //   cy.scrollTo(0, 600);
  //   // No changes in direction
  //   cy.get('#header-test')
  //     .should('have.class', 'i-am-shy');
  //   cy.scrollTo(0, 550);
  //   // intensity not passed, no changes ("intensity 100" means at least 100px of change)
  //   cy.get('#header-test')
  //     .should('have.class', 'i-am-shy');
  //   cy.scrollTo(0, 400);
  //
  //   /*
  //   // TODO qualcosa non va in questo test
  //   // intensity passed, so change
  //   cy.get('#header-test')
  //     .should('not.have.class', 'i-am-shy');
  //   cy.scrollTo(0, 450);
  //   // intensity not passed
  //   cy.get('#header-test')
  //     .should('not.have.class', 'i-am-shy');
  //   cy.scrollTo(0, 500);
  //   // intensity passed
  //   cy.get('#header-test')
  //     .should('have.class', 'i-am-shy');
  //   */
  //
  //   // final check for shy settings
  //   cy.get('#header-test')
  //     .should('have.class', 'i-am-shy')
  //     .should('have.css', 'position', 'fixed');
  // });
  //
  // it('stickyel AND shyel together', () => {
  //   cy.window()
  //     .then($window => {
  //       cy.get('#header-test')
  //         .then($element => {
  //           const { top } = $element[0].getBoundingClientRect();
  //           stickyel($element[0], 'i-am-sticky', $window);
  //           shyel($element[0], {
  //             className: 'i-am-shy',
  //             // needed because it could be awkward if not fixed already
  //             threshold: top + 200,
  //           }, $window);
  //
  //
  //           cy.get('#header-test')
  //             .should('not.have.class', 'i-am-shy')
  //             .should('not.have.class', 'i-am-sticky');
  //           cy.scrollTo(0, top + 199);
  //           cy.get('#header-test')
  //             .should('not.have.class', 'i-am-shy')
  //             .should('have.class', 'i-am-sticky')
  //             .should('have.css', 'position', 'fixed');
  //           cy.scrollTo(0, 500);
  //           cy.get('#header-test')
  //             .should('have.class', 'i-am-sticky')
  //             .should('have.class', 'i-am-shy');
  //           cy.scrollTo(0, 400);
  //           cy.get('#header-test')
  //             .should('have.class', 'i-am-sticky')
  //             .should('not.have.class', 'i-am-shy');
  //         });
  //     });
  // });
})
