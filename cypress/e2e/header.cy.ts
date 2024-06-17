import { shyel, stickyel } from '../../src/index';

describe('Test header manipulation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/header.html');
    cy.scrollTo(0, 0);
  });

  it('stickyel alone - standard', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            stickyel($element[0], 'stickyel-active', $window);
          });
      });

    cy.get('#header-test')
      .should('not.have.class', 'stickyel-active');
    cy.scrollTo(0, 300);
    cy.get('#header-test')
      .should('have.class', 'stickyel-active')
      .should('have.css', 'position', 'fixed');
  });

  it('stickyel alone - custom', () => {
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

  it('shyel alone - standard', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            // position fixed needed
            $element[0].style.position = 'fixed';
            $element[0].style.top = '0px';

            shyel($element[0], 0, {}, $window);
          });
      });

    cy.get('#header-test')
      .should('not.have.class', 'shyel-hide');
    cy.scrollTo(0, 100);
    // threshold yet to surpass
    cy.get('#header-test')
      .should('have.class', 'shyel-hide');
    cy.scrollTo(0, 400);
    // threshold surpassed, and lastScroll start from 0 so intensity pass
    cy.get('#header-test')
      .should('have.class', 'shyel-hide');
  });

  it('shyel alone - custom', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            // position fixed needed
            $element[0].style.position = 'fixed';
            $element[0].style.top = '0px';

            shyel($element[0], 300, {
              // elementHeight
              classShow: 'i-am-shown',
              classHide: 'i-am-hidden',
              intensity: 100
            }, $window);
          });
      });

    // start
    cy.get('#header-test')
      .should('not.have.class', 'i-am-hidden');
    cy.scrollTo(0, 50);
    // threshold yet to surpass
    cy.get('#header-test')
      .should('not.have.class', 'i-am-hidden');
    cy.scrollTo(0, 350);
    // threshold surpassed, and lastScroll start from 0 so intensity pass
    cy.get('#header-test')
      .should('have.class', 'i-am-hidden');
    cy.scrollTo(0, 600);
    // No changes in direction
    cy.get('#header-test')
      .should('have.class', 'i-am-hidden');
    cy.scrollTo(0, 550);
    // intensity not passed, no changes ("intensity 100" means at least 100px of change)
    cy.get('#header-test')
      .should('have.class', 'i-am-hidden');
    cy.scrollTo(0, 400);

    // final check for shy settings
    cy.get('#header-test')
      .should('have.class', 'i-am-hidden')
      .should('have.css', 'position', 'fixed');
  });

  it('stickyel AND shyel together', () => {
    cy.window()
      .then($window => {
        cy.get('#header-test')
          .then($element => {
            const { top } = $element[0].getBoundingClientRect();
            stickyel($element[0], 'i-am-sticky', $window);
            // threshold needed because it could be awkward if not fixed already
            shyel($element[0], top + 200, {
              // elementHeight
              classShow: 'i-am-shown',
              classHide: 'i-am-hidden',
              intensity: 100,
            }, $window);

            cy.get('#header-test')
              .should('not.have.class', 'i-am-hidden')
              .should('not.have.class', 'i-am-sticky');
            cy.scrollTo(0, top + 199);
            cy.get('#header-test')
              .should('not.have.class', 'i-am-hidden')
              .should('have.class', 'i-am-sticky')
              .should('have.css', 'position', 'fixed');
            cy.scrollTo(0, 500);
            cy.get('#header-test')
              .should('have.class', 'i-am-sticky')
              .should('have.class', 'i-am-hidden');
            cy.scrollTo(0, 400);
            cy.get('#header-test')
              .should('have.class', 'i-am-sticky')
              .should('not.have.class', 'i-am-hidden');
          });
      });
  });
})
