import BaseStore from '@/components/utils/BaseStore'

export default class DragRotateImage extends BaseStore {
  private PIXI: any;
  private app: any; //PIXI.Application
  private injectJsClassObj: any;
  private rotateObj: any;
  private anim: any;
  private isClockwise: boolean = false;
	constructor(item: IComponent) {
    super(item)
    this.app = null;
    this.injectJsClassObj = null;
    this.rotateObj = {};
  }
  

  initPixi({PIXI, app}){
    this.app = app;
    this.PIXI = PIXI;
    
    this.injectJsClassObj = this.item.interactionData.injectJsClassObj;
    // let xx = {"jsonUrl":"https://static.hd.xxx.com/upload/biz/1/fighter.json","aniLengths":30}
    // https://static.hd.xxx.com/upload/biz/1/fighter.png
    // https://static.hd.xxx.com/upload/biz/1/fighter.json
    this.app.loader
    .add(this.injectJsClassObj.jsonUrl)
    .load(this.onAssetsLoaded.bind(this));
  }

  onAssetsLoaded() {
    if(this.injectJsClassObj.isDrag) {
      this.addEventListener(this.PIXI);
    }

    let app = this.app;
    // create an array of textures from an image path
    const frames: any = [];
    for (let i = 0; i < this.injectJsClassObj.aniLengths; i++) {
      const val = i < 10 ? `0${i}` : i;
      // magically works since the spritesheet was loaded with the pixi loader
      frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
    }
    // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
    const anim = new PIXI.AnimatedSprite(frames);
    /*
      * An AnimatedSprite inherits all the properties of a PIXI sprite
      * so you can change its position, its anchor, mask it, etc
      */
    anim.x = app.screen.width / 2;
    anim.y = app.screen.height / 2;
    anim.anchor.set(0.5);
    if(this.injectJsClassObj.isPlay) {
      anim.animationSpeed = 0.5;
      anim.play();
    }
    app.stage.addChild(anim);
    this.anim = anim;
    app.ticker.add(this.ticker.bind(this));
  }

  addEventListener (PIXI: any) {
    // let container = new PIXI.Container();
    // this.container = container;
    // app.stage.addChild(container);
    let app = this.app;
    app.stage.interactive = true;
    // let graphics = new PIXI.Graphics();
    // graphics.beginFill("0xffffff", 0.5);
    // graphics.drawRect(0, 0, app.screen.width, app.screen.height);
    // app.stage.addChild(graphics);
    app.stage
      .on('pointerdown', this.onDragStart.bind(this))
      .on('pointerup', this.onDragEnd.bind(this))
      .on('pointerupoutside', this.onDragEnd.bind(this))
      .on('pointermove', this.onDragMove.bind(this));
  }

  onDragStart(event) {
    // store a reference to the data
    this.rotateObj.data = event.data;
    let parent = event.currentTarget;
    this.rotateObj.startX = this.rotateObj.data.getLocalPosition(parent).x;
    this.rotateObj.dragging = true;
  }

  onDragEnd() {
    this.rotateObj.dragging = false;
    this.rotateObj.data = null;
  }

  onDragMove(event) {
    if (this.rotateObj.dragging) {
      let parent = event.currentTarget;
      let currentX = this.rotateObj.data.getLocalPosition(parent).x;
      let moveX = _.parseInt(currentX - this.rotateObj.startX);
      
      if(moveX > 0) {
        this.isClockwise = false;
      } else {
        this.isClockwise = true;
      }
      let frame = moveX%this.injectJsClassObj.aniLengths;
      this.anim.gotoAndStop(frame);
    }
  }

  ticker() {
  }

  destroy() {

  }
}