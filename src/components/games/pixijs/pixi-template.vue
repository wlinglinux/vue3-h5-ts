<template>
  <div class="pixi-template" @click="onPixiTemplateClick" :id="item.id">
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

const onPixiTemplateClick = (e: Event) => {
  e.stopPropagation()
}
</script>


<style lang="scss">
.pixi-template {
  width: inherit;
  height: inherit;
}
</style>


