<template>
  <div v-if="isRight" class="wb-video">
    <img :src="commonAttr.poster">
  </div>
  <video-js v-else :id="getVideoDomId" class="wb-video vjs-theme-fantasy vjs-big-play-centered">
    <source :src="commonAttr.url">
  </video-js>
</template>

<script setup lang="ts">
import { COMMON_WID_HEI } from '@/const/'
import { EventBus, getCompIdByParam } from '@/utils/'
import { useInteractionStore } from "@/store/interaction"
import { useSiteStore } from "@/store/site"
import { showPage, showPop } from '@/components/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
  isRight: boolean,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const useInteraction = useInteractionStore()
const shareData = useInteraction.shareData
const pageIndex = useSite.pageIndex
const popIndex = useSite.popIndex
const pageId = props.pageId
const popId = props.popId

const getVideoDomId = computed(() => {
  if(pageId == -1 && popId == -1) {
    return 'video-'+item.id+'-'
  } else {
    return 'video-'+item.id
  }
})

let videoDom: any
let pauseIndex = 0
let isCanplay: boolean = false
let timeSectionList: IVideoItem[]
let videoPlayer: any = null
/* 设置控制条里面组件的相关属性及显示与否  */
// 'mediaLoader','posterImage','textTrackDisplay','loadingSpinner','bigPlayButton',
// 'liveTracker','controlBar','errorDisplay','textTrackSettings','resizeManager'
// 'playToggle','progressControl','volumePanel','currentTimeDisplay','remainingTimeDisplay','timeDivider','durationDisplay','FullscreenToggle'
const children = ['bigPlayButton','playToggle']
if(commonAttr.isDisplayControls) {
  children.push('progressControl', 'volumePanel','FullscreenToggle')
}
const options = reactive({
  src: { type: 'video/mp4', src: commonAttr.url },
  poster: commonAttr.poster,
  language: 'zh-CN', // 设置语言
  preload: commonAttr.isPreload ? "auto" : "metadata", //none
  autoplay: commonAttr.isAutoPlay, // false true muted play any    (play() on loadstart)
  muted: commonAttr.isMute,
  loop: false,
  controls: commonAttr.isFullScreen || item.conAttr.height/COMMON_WID_HEI.adaptiveScale > COMMON_WID_HEI.clientHeight/5*4 ? false : true,
  responsive: false,
  fill: true,
  fluid: false,
  playsinline: true,
  'webkit-playsinline': true,
  'x5-playsinline': true,
  'x-webkit-airplay': true,
  'x5-video-player-type': 'h5',
  'x5-video-player-fullscreen': true,
  'x5-video-ignore-metadata': true,
  'x5-video-orientation': 'landscape',
  controlBar: { 
    /* 使用children的形式可以控制每一个控件的位置，以及显示与否 */
    children
  },
})
const initComp = () => {
  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    EventBus.$on("loadJsComplete", onLoadJsComplete) 
    return
  }
  EventBus.$on("pauseVideo", onPause)
  EventBus.$on("playVideo", onSeekPlayVideo)
  EventBus.$on("switchVideo", onSwitchVideo)
  EventBus.$on("videoPlayAudio", onPlayAudio)
  EventBus.$on("showPage", onShowPage)
  EventBus.$on("showPop", onShowPop)
  
  timeSectionList = item.lists as IVideoItem[]
  _.forEach(timeSectionList, (videoItem: IVideoItem) => {
    hiddenOrDisplayComp(videoItem, false)
  })
}
const onPause = () => {
  videoPlayer && videoPlayer.paused()
}
const onSeekPlayVideo = (videoData: any) => {
  if(videoPlayer) {
    videoPlayer.muted(false)
  }
  if(!isCanplay) return
  if(videoData) {
    if(videoData.isPlay) {
      onPlay()
    }
    videoPlayer.currentTime(_.toNumber(videoData.time))
  } else {
    onPlay()
  }
}
const onSwitchVideo = (videoData: any) => {
  if(videoData.timeSectionList) {
    timeSectionList = videoData.timeSectionList
  }
  videoPlayer.src({type: 'video/mp4', src: videoData.url})
  videoPlayer.load(videoData.url)
  onPlay()
}
const onPlayAudio = () => {
  videoPlayer.muted(false)
}
const onPlay = () => {
  if((pageIndex >= 0 && pageId == (pageIndex+1) || popIndex >= 0 && popId == (popIndex+1)) && item.conAttr.left < COMMON_WID_HEI.width) {
    videoPlayer.play()
  }
}
const onShowPageOrPage = () => {
  const popIndex = useSite.popIndex
  const pageIndex = useSite.pageIndex
  const videoDom = document.getElementById('video-'+item.id)
  if((isH5Edit && videoDom && (pageId > 0 || popId > 0)) || pageIndex >= 0 && pageId == (pageIndex+1) || popIndex >= 0 && popId == (popIndex+1)) {
    if(!videoPlayer && window.videojs) {
      initVideoPlayer(window.videojs)
    }
  } else {
    // destroyVideo()
  }
}
let videoDomCb: number = -1
const initVideoPlayer = (videojs: any) => {
  videoPlayer = videojs('video-'+item.id, options, () => {
    videoDomCb = window.setInterval(() => {
      videoDom = document.getElementById('video-' + item.id)
      if(videoDom) {
        window.clearInterval(videoDomCb)
        initVideoInline(window.enableInlineVideo)
        onRefreshCommonAttr(item.id)
      }
    }, useSite.siteInfo.reloadTime)
    videoPlayer.on("ended", () => {
      onEnded()
      videoDom.style.setProperty(`--vjs-poster`, 'block')
    })
    videoPlayer.on('timeupdate', onTimeupdate)
    videoPlayer.on('canplay', () => {
      isCanplay = true
    })
    // videoPlayer.on('playing', () => {//开始回放
    //   console.log("开始回放")
    // })
  })
}
const onTimeupdate = () => {
  videoDom.style.setProperty(`--vjs-poster`, 'none')
  if(commonAttr.isAddTimeSection) {
    let item: any
    for(let i = 0, len = timeSectionList.length; i < len; i++){
      item = timeSectionList[i]
      if(videoPlayer.currentTime() >= parseFloat(item.time) && i == pauseIndex){
        if(item.isPauseInTimeSection) {
          onPause()
        }
        videoEndResult(item)
        pauseIndex++
        break;
      }
    }
  }
}
const onEnded = () => {
  pauseIndex = 0
  let resultData: any
  if(commonAttr.isAddTimeSection){
    resultData = timeSectionList[timeSectionList.length-1]
  } else {
    resultData = commonAttr
  }
  videoEndResult(resultData)
}
const videoEndResult = (resultData: any) => {
  _.forEach(timeSectionList, (item: IVideoItem) => {
    hiddenOrDisplayComp(item, false)
  })
  if(resultData.popId > 0) {
    showPop(resultData.popId)
  }else if(resultData.pageId > 0) {
    showPage(resultData.pageId, item)
  }else if(resultData.compId && resultData.compId.length > 0) {
    hiddenOrDisplayComp(resultData, true)
  }
}
const onShowPage = (pageIndex: number) => {
  onShowPageOrPage()
}
const onShowPop = (popIndex: number) => {
  onShowPageOrPage()
}
const destroyVideo = () => {
  if(videoPlayer && videoPlayer.dispose) {
    videoPlayer.dispose()
  }
}
const hiddenOrDisplayComp = (videoItem: IVideoItem, isVisible: boolean) => {
  const compId = getCompIdByParam(videoItem.compId)
  if(compId) {
    useInteraction.updateComponentVisible({ id: compId, commonAttr: { isVisible } })
  }
}
const onRefreshVideoUrl = () => {
  // 抽奖修改视频地址
  if(item.isDynamic && shareData.url || shareData.videoUrl) {
    let url: string = ''
    let posterUrl: string | undefined = ''
    if(shareData.videoUrl) {
      url = shareData.videoUrl
      posterUrl = shareData.posterUrl
    } else if(shareData.url && shareData.url.length > 0) {
      let urls = shareData.url.split(',')
      url = urls[0]
      posterUrl = urls[1] ? urls[1] : ''
    }
    commonAttr.url = url
    commonAttr.poster = posterUrl
    // options.src = { type: '', src: url }
    // options.poster = posterUrl
  }
}
const onLoadJsComplete = () => {
  onShowPageOrPage()
}
const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  if(videoDom) {
    videoDom.style.setProperty(`--video-play-btn-color`, commonAttr.playBtnColor)
    if(!commonAttr.isDisplayControls) {
      videoDom.style.setProperty(`--vjs-control-bar-color`, 'transparent')
    }
  }
}
const initVideoInline = (enableInlineVideo: any) => {
  if(enableInlineVideo) {
    const videos = videoDom.getElementsByTagName("video")
    if(videos && videos.length > 0) {
      _.forEach(videos, (video: HTMLVideoElement) => {
        enableInlineVideo(video, {
          everywhere: true
        });
      })
    }
  }
}
onMounted(() => {
  onRefreshVideoUrl()
  onLoadJsComplete()
})

initComp()

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
    EventBus.$off("loadJsComplete", onLoadJsComplete) 
    return
  }
  if (videoPlayer && videoPlayer.dispose) {
    videoPlayer.dispose()
  }
  EventBus.$off("pauseVideo", onPause)
  EventBus.$off("playVideo", onSeekPlayVideo)
  EventBus.$off("switchVideo", onSwitchVideo)
  EventBus.$off("showPage", onShowPage)
  EventBus.$off("showPop", onShowPop)
})
// defineExpose ({
//   videoPlayer
// })
</script>

<style lang="scss">
.wb-video {
  width: inherit;
  height: inherit;
  --video-play-btn-color: '#fff';
  --vjs-poster: block;
  --vjs-control-bar-color: rgba(43, 51, 63, 0.1);

  img {
    width: 100%;
    object-fit: contain;
  }
}
.vjs-has-started .vjs-poster {
  display: var(--vjs-poster);
}
.vjs-theme-fantasy {
  --vjs-theme-fantasy--primary: var(--video-play-btn-color);
  --vjs-theme-fantasy--secondary: #fff;
}
.vjs-theme-fantasy .vjs-big-play-button {
  width: var(--size-140);
  height: var(--size-140);
  background: none;
  line-height: var(--size-140);
  font-size: var(--size-120);
  border: none;
  top: 50%;
  left: 50%;
  margin-top: var(--size--70);
  margin-left: var(--size--70);
  color: var(--vjs-theme-fantasy--primary);
}
.vjs-theme-fantasy.vjs-big-play-button:focus,
.vjs-theme-fantasy:hover .vjs-big-play-button {
  background-color: transparent;
  color: #fff;
}
.vjs-theme-fantasy .vjs-control-bar {
  height: var(--size-108);
  background-color: var(--vjs-control-bar-color);
}
.vjs-theme-fantasy .vjs-button > .vjs-icon-placeholder:before,
.vjs-theme-fantasy .vjs-time-control {
  line-height: var(--size-108);
  display: block;
}
.vjs-theme-fantasy .vjs-play-control {
  font-size: 1.5em;
  position: relative;
}
.vjs-theme-fantasy .vjs-volume-panel {
  order: 4;
}
.vjs-theme-fantasy .vjs-volume-bar {
  margin-top: 2.5em;
}
.vjs-theme-city .vjs-volume-panel:hover .vjs-volume-control.vjs-volume-horizontal {
  height: 100%;
}
.vjs-theme-fantasy .vjs-progress-control .vjs-progress-holder,
.vjs-theme-fantasy .vjs-progress-control:hover .vjs-progress-holder {
  font-size: 1.5em;
}
.vjs-theme-fantasy .vjs-play-control .vjs-icon-placeholder:before {
  height: 1.3em;
  width: 1.3em;
  margin-top: 0.2em;
  border-radius: 1em;
  border: var(--size-4) solid var(--vjs-theme-fantasy--secondary);
  top: var(--size-8);
  left: var(--size-18);
  line-height: 1.1;
}
.vjs-theme-fantasy .vjs-play-control:hover .vjs-icon-placeholder:before {
  border: var(--size-4) solid var(--vjs-theme-fantasy--secondary);
}
.vjs-theme-fantasy .vjs-play-progress,
.vjs-theme-fantasy .vjs-play-progress:before {
  background-color: var(--vjs-theme-fantasy--primary);
}
.vjs-theme-fantasy .vjs-play-progress:before {
  height: 0.8em;
  width: 0.8em;
  content: "";
  border: var(--size-4) solid var(--vjs-theme-fantasy--secondary);
  border-radius: 0.8em;
  top: -0.25em;
}
.vjs-theme-fantasy .vjs-progress-control {
  font-size: var(--size-28);
}
.vjs-theme-fantasy .vjs-fullscreen-control {
  order: 6;
}
.vjs-theme-fantasy .vjs-remaining-time {
  display: none;
}
.vjs-theme-fantasy.nyan .vjs-play-progress {
  background: linear-gradient(
    180deg,
    #fe0000 0,
    #fe9a01 16.666666667%,
    #fe9a01 0,
    #ff0 33.332666667%,
    #ff0 0,
    #32ff00 49.999326667%,
    #32ff00 0,
    #0099fe 66.6659926%,
    #0099fe 0,
    #63f 83.33266%,
    #63f 0
  );
}
.vjs-theme-fantasy.nyan .vjs-play-progress:before {
  height: 1.3em;
  width: 1.3em;
  background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 125' fill='%23fff'%3E%3Cpath d='M62.153 37.323h2.813v3.246h-2.813zM64.858 40.569h2.813v3.246h-2.813zM67.672 43.814h11.9v3.246h-11.9zM79.572 24.449h2.813v19.365h-2.813zM82.386 37.323h3.244v3.246h-3.244zM85.63 34.132h5.627v3.246H85.63zM91.257 37.323h2.92v12.95h-2.92zM94.177 50.274h2.922V66.21h-2.922zM91.29 66.372h2.887v3.245H91.29zM88.401 69.617h2.889v3.246h-2.889zM27.312 72.863h61.003v3.245H27.312zM73.622 76.108h2.889v3.246h-2.889zM82.563 76.108h2.888v3.246h-2.888zM76.511 79.354h6.053v3.245h-6.053zM61.941 79.354h8.895v3.245h-8.895zM67.947 76.108h2.889v3.246h-2.889zM59.321 76.108h2.888v3.246h-2.888zM27.312 17.917h49.387v3.246H27.312zM76.699 21.162h2.873v3.287h-2.873zM56.372 34.132h5.781v3.191h-5.781zM53.448 37.323h2.924v12.951h-2.924zM50.488 50.274h2.96v16.049h-2.96zM53.448 66.323h2.924v3.257h-2.924zM56.372 69.58h2.949v3.283h-2.949zM65.069 63.213h2.878v6.367h-2.878zM67.947 66.397h17.504v3.22H67.947z'/%3E%3Cpath d='M82.563 63.213h2.888v3.185h-2.888zM73.801 63.213h2.898v3.185h-2.898zM76.699 56.774h2.873v3.145h-2.873zM82.563 56.774h2.888v3.145h-2.888zM85.451 53.444h2.864v3.33h-2.864z'/%3E%3Cpath d='M85.451 56.774h2.864v3.145h-2.864zM65.069 53.444h2.878v3.33h-2.878zM65.069 56.774h2.878v3.145h-2.878zM62.209 56.774h2.86v3.145h-2.86zM21.509 24.327h2.813v45.169h-2.813zM24.323 21.162h2.99v3.165h-2.99zM18.562 69.496h8.75v3.367h-8.75zM15.656 72.863h2.906v9.591h-2.906zM18.562 79.301h8.75v3.153h-8.75zM24.323 76.108h5.743V79.3h-5.743zM33.136 76.108h2.824v6.346h-2.824zM35.96 79.281h5.813v3.173H35.96zM41.774 76.108h2.864v3.173h-2.864zM3.948 40.569h11.708v3.229H3.948zM3.948 43.814h2.921v6.459H3.948zM6.869 47.06h2.934v6.384H6.869zM9.803 50.274h2.909v6.5H9.803z'/%3E%3Cpath d='M12.711 53.444h2.945v6.475h-2.945zM15.656 56.774h5.853v3.145h-5.853z'/%3E%3Cpath d='M18.583 59.919h2.926v3.294h-2.926zM18.583 47.044h2.926v6.4h-2.926zM12.711 43.814h5.872v3.229h-5.872zM15.647 47.044h2.936v3.2h-2.936z'/%3E%3Cpath fill='none' d='M47.439 50.274h3.049v3.17h-3.049z'/%3E%3Cpath d='M73.801 30.94v-3.138h-2.965v-3.354l-37.7-.122v3.151h-3.07v3.462l-2.753-.108-.118 32.381h2.871v3.185h3.07v-3.185h2.824v3.185h-2.824v3.099l20.312.084v-3.257h-2.96V50.274h2.96V37.323h2.924v-3.191h5.781v3.191h2.813l-.108 3.246h2.813v3.246h9.027V30.94h-2.897zM33.136 56.682h-3.07v-3.158h3.07v3.158zm2.824-22.55h-2.824v-3.084h2.824v3.084zm2.907 12.928h2.907v3.184h-2.907V47.06zm5.771 16.153h-2.864v-3.294h2.864v3.294zm2.801-19.399h-2.801v-3.246h2.801v3.246zm6.009-12.766h-2.96v-3.354h2.96v3.354zm8.705 0h-2.832v-3.354h2.832v3.354zm8.683 6.275h-2.889v-3.191h2.889v3.191z'/%3E%3C/svg%3E")
    no-repeat;
  border: none;
  top: -0.35em;
}

</style>
