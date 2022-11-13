import { EventBus, isHasOwnProperty } from '@/utils'
import { COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'

export default class SvgGsapDemo extends BaseStore {
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
  }
  start() {
    const gsap = window.gsap
    const svg: any = document.querySelector("svg");
    const svgns = "http://www.w3.org/2000/svg";
    const targets: any = document.querySelector("#targets");
    
    // change any of these values
    const width = 74;
    const height = 60;
    const columns = 4;
    const rows = 3;
    const fakePadding = 10; // this will be the overall padding and the space between rectangles
    const colorArray = ["#94c356", "#46a4cc", "#a63e4b"];
    let counter = 0;
    
    // figure the new svg width/height
    const svgWidth = width * columns + (columns + 1) * fakePadding;
    const svgHeight = height * rows + (rows + 1) * fakePadding;
    
    gsap.set(svg, {
      attr: {
        width: svgWidth,
        height: svgHeight,
        viewBox: "0 0 " + svgWidth + " " + svgHeight
      }
    });
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < columns; i++) {
        counter++;
        let newRect = document.createElementNS(svgns, "rect");
        let newX = (width + fakePadding) * i + fakePadding;
        let newY = (height + fakePadding) * j + fakePadding;
        gsap.set(newRect, {
          attr: {
            x: newX,
            y: newY,
            width: width,
            height: height,
            fill: colorArray[counter % colorArray.length]
          }
        });
        targets.appendChild(newRect);
        let txt: any = document.createElementNS(svgns, "text");
        txt.textContent = counter;
        svg.appendChild(txt);
        gsap.set(txt, {
          attr: {
            x: newX + width / 2,
            y: newY + height / 2
          }
        });
      }
    }
    
    gsap
      .timeline({ delay: 1 })
      .from("#targets rect", {
        duration: 0.75,
        attr: { x: 0, y: 0 },
        opacity: 0,
        stagger: {
          amount: 0.75,
          from: "random"
        },
        ease: "sine.inOut"
      })
      .from("text", {
        duration: 0.35,
        opacity: 0,
        ease: "none"
      });
  }

  destroy() {
    super.destroy()
  }
}