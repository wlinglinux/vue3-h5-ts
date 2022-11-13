<template>
  <div class="three-template" @click="onThreeTemplateClick" :id="item.id">
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

const onThreeTemplateClick = (e: Event) => {
  e.stopPropagation()
}
</script>


<style lang="scss">
.three-template {
  width: inherit;
  height: inherit;
}
</style>


