import BaseStore from '@/components/utils/BaseStore'
import SimplexNoise from './SimplexNoise'
import { hsl } from './hsl'
// import { KawaseBlurFilter } from 'pixi-filters'

export default class DragIconInCircle extends BaseStore {
  private orbs: Orb[];
  private conAttr: any;
  private app: any;
  private simplex: any;
  private colorPalette: any;
  constructor(item: IComponent) {
    super(item)
    // Create orbs
    this.orbs = [];
  }
  initPixi({PIXI, app}){
    this.conAttr = this.item.conAttr;
    this.app = app;

    // Create a new simplex noise instance
    this.simplex = new SimplexNoise();
    // Create colour palette
    const colorPalette = this.colorPalette = new ColorPalette();
    app.stage.filters = [new PIXI.filters.KawaseBlurFilter(30, 10, true)];
    let designWidth = parseInt(this.commonAttr.designWidth);
    let designHeight = parseInt(this.commonAttr.designHeight);
    for (let i = 0; i < 10; i++) {
      const orb: Orb = new Orb(colorPalette.randomColor(), designWidth, designHeight);
      app.stage.addChild(orb.graphics);
      this.orbs.push(orb);
    }

    this.ticker();
  }
  // Animate!
  ticker () {
    let app = this.app;
    let orbs = this.orbs;
    app.ticker.add(() => {
      orbs.forEach((orb: Orb) => {
        orb.update(this.simplex);
        orb.render();
      });
    });
  }

  setCssVar () {
    let colorPalette = this.colorPalette;
    let orbs = this.orbs;
    document
      .querySelector(".overlay__btn--colors")!
      .addEventListener("click", () => {
        colorPalette.setColors();
        colorPalette.setCustomProperties();
  
        orbs.forEach((orb: Orb) => {
          orb.fill = colorPalette.randomColor();
        });
      });
  }
}


// return a random number within a range
function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// map a number from 1 range to another
function map(n: number, start1: number, end1: number, start2: number, end2: number) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

// ColorPalette class
class ColorPalette {
  private hue: number = 0;
  private saturation: number = 0;
  private lightness: number = 0;
  private complimentaryHue1: number = 0;
  private complimentaryHue2: number = 0;
  private baseColor: any;
  private complimentaryColor1: any;
  private complimentaryColor2: any;
  private colorChoices: any[] = [];
  constructor() {
    this.setColors();
    this.setCustomProperties();
  }

  setColors() {
    // pick a random hue somewhere between 220 and 360
    this.hue = _.parseInt(random(220, 360));
    this.complimentaryHue1 = this.hue + 30;
    this.complimentaryHue2 = this.hue + 60;
    // define a fixed saturation and lightness
    this.saturation = 95;
    this.lightness = 50;

    // define a base color
    this.baseColor = hsl(this.hue, this.saturation, this.lightness);
    // define a complimentary color, 30 degress away from the base
    this.complimentaryColor1 = hsl(
      this.complimentaryHue1,
      this.saturation,
      this.lightness
    );
    // define a second complimentary color, 60 degrees away from the base
    this.complimentaryColor2 = hsl(
      this.complimentaryHue2,
      this.saturation,
      this.lightness
    );
    // store the color choices in an array so that a random one can be picked later
    this.colorChoices = [
      this.baseColor,
      this.complimentaryColor1,
      this.complimentaryColor2
    ];
  }

  randomColor() {
    // pick a random color
    return this.colorChoices[_.parseInt(random(0, this.colorChoices.length))].replace(
      "#",
      "0x"
    );
  }

  setCustomProperties() {
    // set CSS custom properties so that the colors defined here can be used throughout the UI
    document.documentElement.style.setProperty("--hue", this.hue.toString());
    document.documentElement.style.setProperty(
      "--hue-complimentary1",
      this.complimentaryHue1.toString()
    );
    document.documentElement.style.setProperty(
      "--hue-complimentary2",
      this.complimentaryHue2.toString()
    );
  }
}

// Orb class
class Orb {
  private wid: number;
  private hei: number;
  private x: number;
  private y: number;
  private xOff: number;
  private yOff: number;
  private radius: number;
  private scale: number;
  private inc: number;
  private bounds: any;
  public fill: any;
  public graphics: any;
  // Pixi takes hex colors as hexidecimal literals (0x rather than a string with '#')
  constructor(fill = 0x000000, wid = window.innerWidth, hei = window.innerHeight) {
    this.wid = wid;
    this.hei = hei;
    // bounds = the area an orb is "allowed" to move within
    this.bounds = this.setBounds();
    // initialise the orb's { x, y } values to a random point within it's bounds
    this.x = random(this.bounds["x"].min, this.bounds["x"].max);
    this.y = random(this.bounds["y"].min, this.bounds["y"].max);

    // how large the orb is vs it's original radius (this will modulate over time)
    this.scale = 1;

    // what color is the orb?
    this.fill = fill;
    

    // the original radius of the orb, set relative to window height
    this.radius = random(hei / 6, hei / 3);

    // starting points in "time" for the noise/self similar random values
    this.xOff = random(0, wid + this.radius);
    this.yOff = random(0, hei + this.radius);

    console.log(this.xOff, this.yOff);
    // how quickly the noise/self similar random values step through time
    this.inc = 0.002;

    // PIXI.Graphics is used to draw 2d primitives (in this case a circle) to the canvas
    this.graphics = new PIXI.Graphics();
    this.graphics.alpha = 0.825;

    // 250ms after the last window resize event, recalculate orb positions.
    window.addEventListener(
      "resize",
      _.throttle(() => {
        this.bounds = this.setBounds();
      }, 250)
    );
  }

  setBounds() {
    let wid = this.wid;
    let hei = this.hei;
    // how far from the { x, y } origin can each orb move
    const maxDist = wid < 1000 ? wid / 3 : wid / 5;
    // the { x, y } origin for each orb (the bottom right of the screen)
    const originX = wid / 1.25;
    const originY = wid < 1000 ? hei : hei / 1.375;

    // allow each orb to move x distance away from it's x / y origin
    return {
      x: {
        min: originX - maxDist,
        max: originX + maxDist
      },
      y: {
        min: originY - maxDist,
        max: originY + maxDist
      }
    };
  }

  update(simplex: any) {
    // self similar "psuedo-random" or noise values at a given point in "time"
    const xNoise = simplex.noise2D(this.xOff, this.xOff);
    const yNoise = simplex.noise2D(this.yOff, this.yOff);
    const scaleNoise = simplex.noise2D(this.xOff, this.yOff);

    // map the xNoise/yNoise values (between -1 and 1) to a point within the orb's bounds
    this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
    this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
    // map scaleNoise (between -1 and 1) to a scale value somewhere between half of the orb's original size, and 100% of it's original size
    this.scale = map(scaleNoise, -1, 1, 0.5, 1);

    // step through "time"
    this.xOff += this.inc;
    this.yOff += this.inc;
  }

  render() {
    // update the PIXI.Graphics position and scale values
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.scale.set(this.scale);

    // clear anything currently drawn to graphics
    this.graphics.clear();

    // tell graphics to fill any shapes drawn after this with the orb's fill color
    this.graphics.beginFill(this.fill);
    // draw a circle at { 0, 0 } with it's size set by this.radius
    this.graphics.drawCircle(0, 0, this.radius);
    // let graphics know we won't be filling in any more shapes
    this.graphics.endFill();
  }
}