import mouseParallax from '../../src/index';

const parallaxImages = [
  {
    src: "images/rogh-parallax-0.png",
    intensity: 0
  },
  {
    src: "images/rogh-parallax-1.png",
    intensity: 5,
    speed: 20000
  },
  {
    src: "images/rogh-parallax-2.png",
    intensity: 10,
    speed: 10000
  },
  {
    src: "images/rogh-parallax-3.png",
    intensityx: 10,
    intensityy: 5,
    speed: 20000
  },
  {
    src: "images/rogh-parallax-4.png",
    intensityx: 10,
    intensityy: 5,
    speed: 20000
  }
];

// TODO Automated use before going regular
// TODO ENABLE\DISABLE mouse parallax && put fixed value instead of mouse (for animations), maybe for some seconds
describe('Test mouseParallax (visual test only)', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8080/empty.html');
  });

  it('Regular use', () => {
    cy.document()
      .then($document => {
        cy.addImages('#parallax-object', parallaxImages)
          .then((elements = []) => {
            const parallaxObject = mouseParallax(elements, null, $document);
            if(!parallaxObject)
              return;
            parallaxObject.build();
          });
      });
  });
})


/*
    mounted() {
    // init
    this.parallax = mouseParallax(this.$refs["parallax-items"]);
    // Fade in background
    setTimeout(() => {
      this.$refs["hero-header"].classList.add("present-rogheneach");
    }, 1000);
    // Move in single direction, ignoring the mouse
    setTimeout(() => {
      executeMouseParallax(this.parallax, 40, 1200)
    }, 2000);
    // Activate true mouse parallax after speeding up all parallax-layers
    setTimeout(() => {
      // speed up all elements
      for(let i = this.headerImages.length; i--; )
        // this.headerImages[i].speed = this.headerImages[i].speed / 10;
        this.$set(this.headerImages[i], 'speed', this.headerImages[i].speed / 20)
      // update with the new values
      // this.$forceUpdate();
      // after changes
      this.$nextTick(() => {
        // re init is needed
        this.parallax = mouseParallax(this.$refs["parallax-items"]);
        // unlock
        this.activatedParallax = true;
      })
    }, 8000);
  }
 */
