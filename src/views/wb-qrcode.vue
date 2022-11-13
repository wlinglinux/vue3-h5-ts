<template>
  <div class="pc-display-qrcode-con pc-display-qrcode" :style="pcQrcodeStyle">
    <p class="title">请在移动端查看</p>
    <img :src="url">
    <i class="jy-icon-scan-code"></i>
    <p>打开手机微博<br>扫一扫在手机端查看</p>
  </div>
</template>
<script lang="ts" setup>
import { useSiteStore } from '@/store/site'
import { getPxOVwByValue } from '@/utils/'

const pcQrcodeStyle = {
  width: getPxOVwByValue(400),
  height: getPxOVwByValue(600),
}
const siteStore = useSiteStore()
const apiUrl = siteStore.siteInfo.env.apiUrl
const siteId = siteStore.siteInfo.id

let url = ref('')
window.axios.get(apiUrl + '/site/preshow?site_id=' + siteId).then(function (response: any) {
  url.value = response.data.data.qrcode
})
</script>


<style lang="scss" scoped>
.pc-display-qrcode-con{
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 1000;
}
.pc-display-qrcode{
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-content: center;
  align-items: center;
  margin: auto;
}
.pc-display-qrcode p{
  text-align: center;
}
</style>