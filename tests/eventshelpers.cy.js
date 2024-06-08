import { addEvent, removeEvent } from '../../src';

describe('Intersection, lazyload and addEvent', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/eventshelpers.html')
  });

  it('Add event in an optimized way', () => {
    cy.document()
      .then($document => {
        addEvent($document, 'click', '#test-addevent', function() {
          // this == e.target == clicked element in this case
          this.classList.add('i-am-pressed');
        });
        removeEvent();
      });

    cy.get('#test-addevent')
      .click()
      .should('have.class', 'i-am-pressed');
  });
})
