import { defineStore, acceptHMRUpdate } from 'pinia'

class IsLoadJsObj implements IIsLoadJsObj {
  public isAudio: boolean = false
  public isVideo: boolean = false
  public isMatter: boolean = false
  public isSwiper: boolean = false
  public isShake: boolean = false
  public isMoveable: boolean = false
  public isHtml2canvas: boolean = false
  public isGsap: boolean = false
  public isPhaser: boolean = false
  public isPixi: boolean = false
  public isPixiFilters: boolean = false
  public isThree: boolean = false
  public isSvgAnimate: boolean = false
  public isSlotMachine: boolean = false
  public isCustomFont: boolean = false
  public isDefaultFont: boolean = false
  public isCreatejs: boolean = false
  public isEaseljs: boolean = false

  public isOrbitControls: boolean = false
  public isGsapBezier: boolean = false
  public isGltfLoader: boolean = false
  public isPanorama: boolean = false

  public isScanQRCode: boolean = false
  public isJsBarcode: boolean = false
  public isSvga: boolean = false
  public isSvg: boolean = false
  public isPaper: boolean = false
  
  public isLoadAssets: boolean = false
  public isAnimate: boolean = false
  public isTurnBook: boolean = false
  public isNeedUploadParams: boolean = false
}

class IsLoadAnimate implements IIsLoadAnimate {
  public isAnimate: IHavePageIdOrComId = {}                    //animate 动画 加载css
  public isGroupGsap: IHavePageIdOrComId = {}
  public isGsap: IHavePageIdOrComId = {}
  public isPathBezier: IHavePageIdOrComId = {}
}

export const useLoadsStore = defineStore('assets',{
  state: (): IIsLoad => {
    return {
      isLoadJsObj: new IsLoadJsObj(),
      isLoadAnimate: new IsLoadAnimate(),
    }
  },
  getters: {

  },
  actions: {

  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLoadsStore, import.meta.hot))
}