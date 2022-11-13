import { EventBus } from '@/utils'
import { COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'

export default class TwistedEggMatter extends BaseStore {
  private twistedEgg: null | ((isPostWbEventOrCommonEvents: any) => void) 
  constructor(item: IComponent) {
    super(item)
    //子类覆盖]
    this.twistedEgg = null
  }

  start() {
    // {"matter":{"width":400,"height":400,"ballWidth":124,"ballHeight":148,"ratio":0.8,"imgs":[]}}
    let matterObj = this.item.interactionData.injectJsClassObj.matter
    const textures = matterObj.imgs
    const bubbleWidth = matterObj.ballWidth*matterObj.ratio
    // const bubbleHeight = parseInt(matterObj.ballHeight*matterObj.ratio)
    const conWidth = parseInt(matterObj.width)
    const conHeight = parseInt(matterObj.height)
    const gravityY = parseInt(matterObj.gravityY)

    // --matter-canvas-scale
    let matterCanvasStyle = document.documentElement.style
    matterCanvasStyle.setProperty(`--matter-canvas-scale`, (1/COMMON_WID_HEI.adaptiveScale).toString())
    // module aliases
    let Matter = window.Matter
    let Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite
      // Composites = Matter.Composites
    
    // create an engine
    let engine = Engine.create()
    
    // create a renderer
    let render = Render.create({
      element: document.getElementById(this.item.id),
      engine: engine,
      options: {
        width: conWidth,
        height: conHeight,
        wireframes: false,
        background: 'transparent',
      }
    })
    engine.world.gravity.x = 0
    engine.world.gravity.y = 0.5
    // render.options.background = 'transparent'
    
    // create balls and a ground
    const bodys: any[] = []
    let i = -1
    let shapeAmount = textures.length
    // let xx = conWidth - (shapeAmount * bubbleWidth/2)
    // let yy = conHeight - (shapeAmount * bubbleHeight/2)
    let positionXs = [122.78585140770514,209.3235376646257,326.01634544621396,101.52559109065926,188.39323934095015,282.38697650836866]
    let positionYs = [183.38542746227944,230.06200548401105,207.91038110198647,279.55905905222403,326.1084787517811,296.24269011459813]
    // let stack = Composites.stack(xx, yy, 3, 2, 0, 0, function(x, y) {
    //     i++
    //     return Bodies.circle(x, y, bubbleWidth/2, {
    //       friction: 0.001, //摩擦力
    //       frictionAir: 0.005, //空气阻力
    //       restitution: 0.9, //反弹指数
    //       density: 0.05, //密度
    //       // isSleeping: true,
    //       render: {
    //         visible: true,
    //         opacity: 1,
    //         sprite: {
    //           texture: textures[i],
    //         },
    //       }
    //   })
    // })
    for(let i = 0; i < shapeAmount; i++) {
      let body: any = Bodies.circle(positionXs[i], positionYs[i], bubbleWidth/2, {
        friction: 0.001, //摩擦力
        frictionAir: 0.005, //空气阻力
        restitution: 0.9, //反弹指数
        density: 0.05, //密度
        // isSleeping: true,
        render: {
          // visible: true,
          // opacity: 1,
          sprite: {
            texture: textures[i],
          },
        }
      })
      bodys.push(body)
    }
    
    // 圆形ground
    let m = Math.min(conWidth, conHeight)
    let rat = 1 / 4.5 * 2
    let r = m * rat	
    let parts: any[] = []	
    let pegCount = 64
    const TAU = Math.PI * 2
    let segment,angle2,x2,y2,cx2,cy2,rect: any
    for(i = 0 ;i < pegCount ;i++) {
      segment = TAU / pegCount
      angle2 = i / pegCount * TAU + segment / 2
      x2 = Math.cos(angle2)
      y2 = Math.sin(angle2)
      cx2 = x2 * r + conWidth/2
      cy2 = y2 * r + conHeight/2
      rect = addRect({ x: cx2, y: cy2, w: 10 / 1000 * m, h: 400 / 1000 * m, options: { angle: angle2, isStatic: true, density: 1, render: {
        fillStyle: 'transparent',
        strokeStyle: 'transparent',
        lineWidth: 1
      }}})
      parts.push(rect)
    }
    
    function addRect({ x = 0, y = 0, w = 10, h = 10, options = {} } = {}) {
      let body = Bodies.rectangle(x, y, w, h, options)
      addBody(body)
      return body
    }
    
    function addBody(...bodies) {
      World.add(engine.world, ...bodies)
    }
    
    Composite.add(engine.world, bodys)

    // run the renderer
    Render.run(render)
    
    // 使渲染视图适合场景
    Render.lookAt(render, Composite.allBodies(engine.world))
    
    // create runner
    let runner// = Runner.create()
    
    // run the engine
    // Runner.run(runner, engine)
    // Runner.stop(runner)

    // onStart()
    function onStart(item: IComponent) {
      if(!runner) {
        runner = Runner.create()
        Runner.run(runner, engine)
      } else {
        Runner.run(runner, engine)
      }
      let balls = bodys
      let timeout = 0
      for(let i = 0; i < balls.length*2; i++) {
        window.setTimeout(() => {
          randomBall(balls[i%balls.length])
        }, timeout)
        timeout += 100
      }
      window.setTimeout(() => {
        Runner.stop(runner)
        isPostWbEventOrCommonEvents({ item: item, loadEvent: null})
      }, timeout*3)
    }
    function randomBall(ball){
      Matter.Body.applyForce(ball, ball.position, { x: 0, y: -Math.random()*gravityY })
    }

    this.twistedEgg = onStart
    EventBus.$on("twistedEgg", onStart)
  }

  destroy(){
    super.destroy()
    EventBus.$off("twistedEgg", this.twistedEgg)
  }
}
