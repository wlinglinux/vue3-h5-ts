import { getMapByArr } from '@/utils/'


const ANIMATE_TRIGGER_TYPE = [
  { name:'自动', value: 0, key: 'auto' },
  { name:'点击', value: 1, key: 'click' },
]
const ANIMATE_TRIGGER_TYPE_MAP =  getMapByArr(ANIMATE_TRIGGER_TYPE)

const GSAP_EASE_TYPES = [
  { name:'none', value: 'none' },
  { name:'power1', value: 'power1' },
  { name:'power2', value: 'power2' },
  { name:'power3', value: 'power3' },
  { name:'power4', value: 'power4' },
  { name:'back', value: 'back' },
  { name:'elastic', value: 'elastic' },
  { name:'bounce', value: 'bounce' },
  { name:'circ', value: 'circ' },
  { name:'expo', value: 'expo' },
  { name:'sine', value: 'sine' },
]

const GSAP_EASE_TYPES_MAP = getMapByArr(GSAP_EASE_TYPES)

const GSAP_EASE_INOUT_TYPES = [
  { name:'none', value: 'none' },
  { name:'in', value: 'in' },
  { name:'out', value: 'out' },
  { name:'inOut', value: 'inOut' },
]

const GSAP_EASE_INOUT_TYPES_MAP = getMapByArr(GSAP_EASE_INOUT_TYPES)
const GSAP_FROM_TYPES_MAP = {
  center: 'center',
  end: 'end',
  edges: 'edges',
  random: 'random',
  index: 'index',
}
const GSAP_AXIS_TYPES_MAP = {
  none: '',
  x: 'x',
  y: 'y',
}
//锚,两个控制点,锚,两个控制点,锚等尽可能多的迭代
const ANIMATE_BEZIER_TYPE = [
  { name:'none', value: '' },
  { name:'cubic', value: 'cubic' },
]
const ANIMATE_BEZIER_TYPE_MAP = getMapByArr(ANIMATE_BEZIER_TYPE)


export {
  ANIMATE_TRIGGER_TYPE,
  ANIMATE_TRIGGER_TYPE_MAP,
  GSAP_EASE_TYPES,
  GSAP_EASE_TYPES_MAP,
  GSAP_EASE_INOUT_TYPES,
  GSAP_EASE_INOUT_TYPES_MAP,
  GSAP_FROM_TYPES_MAP,
  GSAP_AXIS_TYPES_MAP,
  ANIMATE_BEZIER_TYPE,
  ANIMATE_BEZIER_TYPE_MAP,
}