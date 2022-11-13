<template>
  <div class="paper-template" @click="onPaperTemplateClick" :id="item.id">
    <slot name="common"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  item: IComponent,
  pageId: number,
  popId: number,
  isPropagation?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
  isPropagation: true
})

const onPaperTemplateClick = (e: Event) => {
  e.stopPropagation()
}
</script>

<style lang="scss">
.paper-template {
  width: inherit;
  height: inherit;
}
</style>


