declare interface ISpriteSheet {
  currentStep: number
  duration: number
  width: number
  height: number
  steps: number
  url: string
  scale?: number
  resetStep?: number
}