<template>
  <group-component v-if="globalShareItem" :item="globalShareItem" :pageId="-1" :popId="-1" class="wid-hei-inherit global-share-container isHidePage" ></group-component>
</template>

<script lang="ts" setup>
import { useSiteStore } from '@/store/site'
import { searchComponentDataById } from '@/store/utils/'

const siteStore = useSiteStore()
const pages = siteStore.pages
const pageIndex = siteStore.pageIndex
const getCurrentPage = siteStore.getCurrentPage

const globalShareItem = () => {
  let currentPage = pages[pageIndex]
  let otherGroup = siteStore.isGlobalShareComponents[getCurrentPage.id]
  let components = otherGroup && otherGroup.components
  let componentData: IComponent
  let needGroup: IGroup = { id: 'global-share-comp', components:[] }
  if(components) {
    for(let i: number = 0, len: number = components.length; i < len; i++) {
      componentData = components[i]
      const componentDataInPage = searchComponentDataById(componentData.id, currentPage)
      if(!componentDataInPage) {
        needGroup.components.push(componentData)
        break
      }
    }
  }
  return needGroup
}
</script>

<style scoped>
.global-share-container {
  position: absolute;
  top: 0;
  left: 0;
}
</style>