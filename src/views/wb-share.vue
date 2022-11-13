<template>
  <van-popup v-model:show="isShow" class="share">
    <img src="https://static.hd.xxx.com/jye/fe-ssr/images/share@2x.png" @click="hide">
  </van-popup>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { initPost } from '@/components/events/init-event'
import { INIT_API_MAP } from '@/service/api'
import { getQueryString, isWeiXin, isWeibo, dynamicsLoadScript, EventBus } from '@/utils/'
import { showAlert } from '@/components/utils/'

const props = defineProps<{ 
  item: any,
}>()

const isShow = ref(false)
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const siteAttrs = useSite.attrs
const userInfo = useSite.userInfo
const env = useSite.siteInfo.env

const show = () => {
  isShow.value = true
}
const hide = () =>{
  isShow.value = false
}
const initShareData = (wxTicket: any) => {
  if(isH5Edit || !siteAttrs.share || !wxTicket){
    return
  }
  const shareData = siteAttrs.share
  let link = window.location.href.split("?")[0] + "?id=" + getQueryString("id")
  if(userInfo.uid){
    link += "&uid=" + userInfo.uid
  }
  const wxShareData = {
    desc: shareData.bIsWxChecked ? shareData.wxShare.desc : shareData.allShare.desc,
    title: shareData.bIsWxChecked ? shareData.wxShare.title : shareData.allShare.title,
    link: link,
    imgUrl: shareData.icon,
    trigger: function(res: any) {
      console.log(res);
      // wxShareData.title = ""
    },
    success: function(res: any) {
      console.log(res)
    }
  }

  const wbShareData = {
    icon: shareData.icon,
    desc: shareData.bIsWbChecked ? shareData.wbShare.title : shareData.allShare.title,
    title: shareData.bIsWbChecked ? shareData.wbShare.desc : shareData.allShare.desc,
    link: link,
  }

  const signPackage = wxTicket
  const share = {
    wxInit: function() {
      window.wx.config({
        debug: false,
        appId: signPackage["appId"],
        timestamp: signPackage["timestamp"],
        nonceStr: signPackage["nonceStr"],
        signature: signPackage["signature"],
        jsApiList: [
          // 所有要调用的 API 都要加到这个列表中
          "onMenuShareTimeline",
          "onMenuShareAppMessage",
          'getLocation',
        ]
      })
      window.wx.onMenuShareTimeline(wxShareData)
      window.wx.onMenuShareAppMessage(wxShareData)
      window.wx.getLocation(wxShareData)
    },
    wbInit: function() {
      window.WeiboJSBridge.invoke(
        "setSharingContent",
        {
          external: wbShareData
        },
        {
          success: function(params: any) {
            console.log("success_" + JSON.stringify(params))
          },
          fail: function(params: any, code: number) {
            console.log("fail_" + JSON.stringify(params) + "_" + code)
          },
          final: function(params: any) {
            console.log("final" + JSON.stringify(params))
          }
        }
      )
      window.WeiboJSBridge.invoke('getBrowserInfo', {}, {
        success: function(params: any) {
          const useSite = useSiteStore()
          useSite.siteInfo.wbFrom = params.from
        },
        fail: function(params: any, code: any) {
          showAlert('获取浏览器信息失败！' + code);
        },
        final: function(params: any) {
          // alert('定位结束！');
        },
      })
      window.WeiboJSBridge.invoke('getAid', {}, {
        success: function(params: any) {
          const useSite = useSiteStore()
          useSite.siteInfo.wbAid = params.aid
        },
        fail: function(params: any, code: any) {
          showAlert('获取浏览器信息失败！' + code);
        },
        final: function(params: any) {
          // alert('定位结束！');
        },
      })
      // alert(window.wx.getBrowserInfo()) 
      // alert(window.wx.getUserInfo())
      // alert(window.wx.getAid())
    }
  };

  if (isWeiXin()) {
    if(window.wx) {
      share.wxInit()
    } else {
      dynamicsLoadScript(env.baseUrl + 'js/jweixin-1.6.0.js', 'wx', function () {
        // window.wx.ready(function() {
          share.wxInit()
        // })
      })
    }
  } else if (isWeibo()) {
    if (window.WeiboJSBridge) {
      share.wbInit()
    } else {
      document.addEventListener("WeiboJSBridgeReady", function() {
        share.wbInit()
      })
    }
  }
  // function setshare() {
  //   if (pattern_wx.test(userAgent)) {
  //     share.wxInit();
  //   }
  //   if (pattern_weibo.test(userAgent)) {
  //     share.wbInit();
  //   }
  // }
}
const initComp = () => {
  if (!useSite.siteInfo.wxTicket) {
    initPost(INIT_API_MAP.share, {type: 'share'}, { url: encodeURIComponent(window.location.href) })

    EventBus.$on("refreshWxTicket", () => {
      initShareData(useSite.siteInfo.wxTicket)
    })
  }
}

initComp()
</script>

<style scoped>
.van-popup{
  background-color: transparent;
}
</style>

