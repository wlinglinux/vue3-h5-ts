<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-audio">
        <div ref="refDom" class="wb-audio-css"></div>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { EventBus, getPxOVwByValue, isJSON } from '@/utils/'
import { getCompStyle} from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
// const siteInfo = useSite.siteInfo
const pageId = props.pageId
const popId = props.popId
const styles = computed(() => {
  return getCompStyle(item)
})
const onPlayOrPause = ({ isPlay, isTouch = false }) => {
  if(isPlay) {
    onPlay()
  } else {
    //isTouch这个是前端触发事件触发的 这个值都是 true
    onPause(isTouch)
  }
}
const onPause = (isTouch: boolean) => {
  //在切换页面的时候 如果不是 页面fixed就暂停
  if(isTouch || !item.commonAttr.isPageFixed) {
    aplayer && aplayer.pause()
  }
}
const onPlay = () => {
  const popIndex = useSite.popIndex
  const pageIndex = useSite.pageIndex
  if(item.commonAttr.isPageFixed ||pageIndex >= 0 && pageId == (pageIndex+1) || popIndex >= 0 && popId == (popIndex+1)) {
    aplayer && aplayer.play()
  }
}
const onSwitchAudio = (data: any) => {
  if(aplayer){
    aplayer.list.clear()
    aplayer.list.add([
      data
    ])
    aplayer.skipForward()
    aplayer.play()
  }
}

const setGlobalCss = () => {
  // {"lrcColor":"#fff","lrcSize":"12","lrcActiveSize":"12","lrcUrl":'',"coverWidth":"100","coverHeight":"100","authorColor":"","authorSize":"","titleColor":"","titleSize":""}
  if(commonAttr.params && isJSON(commonAttr.params)) {
    const docStyle = aplayerDom.style
    const customObj = JSON.parse(commonAttr.params)
    if(commonAttr.cover || customObj.coverWidth) {
      docStyle.setProperty(`--aplayer-pic-display`, "block")
      docStyle.setProperty(`--aplayer-width`, getPxOVwByValue(customObj.coverWidth))
      docStyle.setProperty(`--aplayer-height`, getPxOVwByValue(customObj.coverHeight))
      let picTop = (item.conAttr.height - customObj.coverHeight)/2
      docStyle.setProperty(`--aplayer-pic-top`, getPxOVwByValue(picTop))
    } else {
      docStyle.setProperty(`--aplayer-pic-display`, "none")
    }

    if(commonAttr.name || commonAttr.artist) {
      docStyle.setProperty(`--aplayer-music-display`, "block")
      if(customObj.authorColor) {
        docStyle.setProperty(`--aplayer-author-color`, customObj.authorColor)
      }
      if(customObj.authorSize) {
        docStyle.setProperty(`--aplayer-author-size`, getPxOVwByValue(customObj.authorSize))
      } else {
        docStyle.setProperty(`--aplayer-author-size`, getPxOVwByValue(24))
      }
      if(customObj.titleColor) {
        docStyle.setProperty(`--aplayer-title-color`, customObj.titleColor)
      }
      if(customObj.titleSize) {
        docStyle.setProperty(`--aplayer-title-size`, getPxOVwByValue(customObj.titleSize))
      } else {
        docStyle.setProperty(`--aplayer-title-size`, getPxOVwByValue(28))
      }
    } else {
      docStyle.setProperty(`--aplayer-music-display`, "none")
    }

    if(commonAttr.lrc) {
      if(customObj.lrcUrl) {
        docStyle.setProperty(`--aplayer-lrc-current-url`, customObj.lrcUrl)
      }
      if(commonAttr.isDisplayControls) {
        docStyle.setProperty(`--aplayer-lrc-height`, getPxOVwByValue(item.conAttr.height - 60))
      }else{
        docStyle.setProperty(`--aplayer-lrc-height`, getPxOVwByValue(item.conAttr.height))
      }
      if(customObj.lrcColor) {
        docStyle.setProperty(`--aplayer-lrc-color`, customObj.lrcColor)
      }
      if(customObj.lrcSize) {
        docStyle.setProperty(`--aplayer-lrc-size`, getPxOVwByValue(customObj.lrcSize))
      }else{
        docStyle.setProperty(`--aplayer-lrc-size`, getPxOVwByValue(24))
      }
      if(customObj.lrcActiveSize) {
        docStyle.setProperty(`--aplayer-lrc-active-size`, getPxOVwByValue(customObj.lrcActiveSize))
      }else{
        docStyle.setProperty(`--aplayer-lrc-active-size`, getPxOVwByValue(28))
      }
      if(customObj.lrcAlign) {
        docStyle.setProperty(`--aplayer-lrc-align`, customObj.lrcAlign)
      }
      if(customObj.lrcLineHeight) {
        docStyle.setProperty(`--aplayer-lrc-line-height`, getPxOVwByValue(customObj.lrcLineHeight))
      } else {
        docStyle.setProperty(`--aplayer-lrc-line-height`, getPxOVwByValue(48))
      }
    }

    if(commonAttr.isMini) {
      docStyle.setProperty(`--aplayer-info-display`, "none")
    } else {
      docStyle.setProperty(`--aplayer-info-display`, "block")
    }
  }
}
const initAPlayer = (APlayer: any) => {
  const popIndex = useSite.popIndex
  const pageIndex = useSite.pageIndex
  const isSwiper = useSite.isSwiper 
  if(!isSwiper && !(pageIndex >= 0 && pageId == (pageIndex+1) || popIndex >= 0 && popId == (popIndex+1))) {
    return
  }
  const options = {
    container: aplayerDom,
    fixed: commonAttr.isFiexed,
    mini: commonAttr.isMini,
    autoplay: commonAttr.isAutoPlay,
    volume: commonAttr.volume,
    preload: 'auto',//'none', 'metadata', 'auto'
    theme: commonAttr.theme,
    loop: commonAttr.loop ? "all" : "none",//音频循环播放, 可选值: 'all', 'one', 'none'
    // order: 'list',//音频循环顺序, 可选值: 'list', 'random'
    audio: [{
      name: item.commonAttr.name,
      artist: item.commonAttr.artist,
      url: item.commonAttr.url,
      cover: commonAttr.cover,
      theme: commonAttr.theme,
      lrc: commonAttr.lrc,//[00:00.00]APlayer\n[00:04.01]is\n[00:08.02]amazing //lrc.lrc
      // type: "hls",//'auto', 'hls', 'normal'
    }],
    mutex: true,
    // listFolded: false,
    // listMaxHeight:
    lrcType: commonAttr.lrc ? 3 : 2,//0
  }
  aplayer = new APlayer(options)
  // aplayer.on('play', () => {
  //    aplayer.play();
  // });
  // aplayer.on('pause', () => {
  //    aplayer.pause();
  // });
  // aplayer.on('ended', () => {
  //    aplayer.pause();
  //    EventBus.$emit("pauseVideo");
  // });
  aplayer.on('loadeddata', () => {
    //用户触摸触发自动播放音乐并触发关联事件与按钮图片联动刷新按钮状态和图片动画 2615
    if(commonAttr.isAutoPlay) {
      onPlay()
      // useInteraction.shareInteractionData.autoPlayAudioCompId = item.id
    }
  });

  setGlobalCss();
}
const destroyAPlayer = () => {
  if(aplayer) {
    aplayer.pause()
    aplayer.destroy()
    aplayer = null
  }
}
const onLoadJsComplete = () => {
  initAPlayer(window.APlayer)
}
const initComp = () => {
  if(useSite.isH5Edit) {
    EventBus.$on("loadJsComplete", onLoadJsComplete) 
    return
  }
  EventBus.$on("playOrPauseAudio", onPlayOrPause)
  EventBus.$on("switchAudio", onSwitchAudio)
}

initComp()

const refDom = ref<any>(null)
let aplayerDom: any
let aplayer: any
onMounted(() => {
  aplayerDom = refDom.value
  onLoadJsComplete()
})

onBeforeUnmount(() => {
  if(useSite.isH5Edit) {
    EventBus.$off("loadJsComplete", onLoadJsComplete) 
    return
  }
  EventBus.$off("playOrPauseAudio", onPlayOrPause)
  EventBus.$off("switchAudio", onSwitchAudio)
  destroyAPlayer()
})
</script>



<style lang="scss" scope>
@import "@/assets/scss/a-player.scss";
.wb-audio {
  width: inherit;
  height: inherit;
}
</style>