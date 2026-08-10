import { activateLazyload, setIntersection, setLazyload } from '../../src';

/**
 * The value of running lazyload in a real browser rather than jsdom is the
 * things jsdom cannot do: decide intersections from real geometry, and fire a
 * real, non-bubbling `load` event once a file has actually been fetched. The
 * attribute bookkeeping is already covered by the unit suite, so these specs
 * concentrate on the parts only a browser can answer.
 *
 * Every asset is local, every box is 300px tall inside a 660px viewport, and
 * the spacers between them are 1000px. `scrollIntoView` therefore brings a
 * target fully on screen and leaves its neighbours entirely off it.
 */
const startLazyload = () =>
  cy.get('img, video, picture').then(($elements) => {
    setIntersection($elements.get(), {
      // 0px rather than the 500px activateLazyload uses, so a target only loads
      // when it is genuinely on screen and the spec can assert the difference.
      rootMargin: '0px 0px',
      threshold: 1,
      single: true,
      intersectingCallback: (entry) => {
        setLazyload([entry]);
      },
    });
  });

describe('Lazyload in a real browser', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/lazyload.html');
    cy.scrollTo('top');
  });

  /**
   * The top spacer keeps everything off screen at rest. If anything loaded here
   * the observer would not be deferring at all and every later assertion would
   * pass for the wrong reason.
   */
  it('leaves everything deferred until it is scrolled to', () => {
    startLazyload();

    cy.get('#image-plain').should('have.attr', 'data-src');
    cy.get('#image-second').should('have.attr', 'data-src');
    cy.get('#picture-fallback').should('have.attr', 'data-src');
    cy.get('#video-source').should('have.attr', 'data-src');
    cy.get('#video-direct').should('have.attr', 'data-src');
  });

  it('loads an img once it is fully on screen', () => {
    startLazyload();

    cy.get('#image-plain').scrollIntoView();

    cy.get('#image-plain').should('not.have.attr', 'data-src');
    cy.get('#image-plain').should('have.attr', 'src', 'images/sally.jpg');
  });

  /**
   * The load event is what marks an image finished. It only fires once the
   * browser has actually fetched and decoded the file, so this is the one place
   * the loaded class can be checked against reality rather than a synthetic
   * event.
   */
  it('marks an img loaded once the file has really arrived', () => {
    startLazyload();

    cy.get('#image-plain').scrollIntoView();

    cy.get('#image-plain').should('have.class', 'loaded');
  });

  it('loads a picture, its source and its fallback img', () => {
    startLazyload();

    cy.get('#picture-block').scrollIntoView();

    cy.get('#picture-block source').should('not.have.attr', 'data-srcset');
    cy.get('#picture-block source').should('have.attr', 'srcset', 'images/depth-1.png');
    cy.get('#picture-fallback').should('not.have.attr', 'data-src');
    cy.get('#picture-fallback').should('have.attr', 'src', 'images/depth-2.png');
  });

  /**
   * The load event fires on the inner img and does not bubble, so a listener on
   * the picture element itself would never see it. Only a real browser fetch
   * can show whether the class arrives.
   */
  it('marks a picture loaded once its inner img has really arrived', () => {
    startLazyload();

    cy.get('#picture-block').scrollIntoView();

    cy.get('#picture-block').should('have.class', 'loaded');
  });

  it('loads a video through its source element', () => {
    startLazyload();

    cy.get('#video-sourced').scrollIntoView();

    cy.get('#video-source').should('not.have.attr', 'data-src');
    cy.get('#video-source').should('have.attr', 'src', 'media/clip.webm');
  });

  /**
   * The element is told to reload after its sources are swapped in, so it ends
   * up with real data rather than the empty source it was parsed with.
   */
  it('gets a video playable after the swap', () => {
    startLazyload();

    cy.get('#video-sourced').scrollIntoView();

    cy.get('#video-sourced').should(($video) => {
      // HAVE_CURRENT_DATA or better means the swap reached the decoder
      expect(($video[0] as HTMLVideoElement).readyState).to.be.greaterThan(1);
    });
  });

  it('loads a video carrying its own src', () => {
    startLazyload();

    cy.get('#video-direct').scrollIntoView();

    cy.get('#video-direct').should('not.have.attr', 'data-src');
    cy.get('#video-direct').should('have.attr', 'src', 'media/clip.mp4');
  });

  /**
   * The forced list is for media that must not wait for a scroll. It is the one
   * part of activateLazyload that has to happen before any intersection.
   */
  it('activateLazyload loads the forced elements straight away', () => {
    cy.document().then(($document) => {
      activateLazyload(
        $document.querySelectorAll(
          'img:not(.lazyload-forced), video:not(.lazyload-forced), picture:not(.lazyload-forced)'
        ),
        $document.querySelectorAll('.lazyload-forced')
      );
    });

    cy.get('#image-forced').should('not.have.attr', 'data-src');
    cy.get('#image-forced').should('have.attr', 'src', 'images/depth-3.png');
    // the deferred list is a long way down and stays untouched
    cy.get('#image-second').should('have.attr', 'data-src');
  });

  /*
   * There is deliberately no test here for the 500px rootMargin loading an
   * element before it reaches the fold.
   *
   * Cypress runs the page in an iframe, and with `root: null` the implicit root
   * is the top-level viewport. rootMargin expands the root, but it cannot undo
   * the clipping at the iframe boundary, so an element scrolled past the
   * iframe's fold never intersects however large the margin is — a native
   * IntersectionObserver behaves exactly the same way here. The margin is
   * asserted in the unit suite instead, where the observer is under our control.
   */
});
