<template>
  <section 
    :class="['sidebar-section', $attrs.class]"
    v-bind="$attrs"
  >
    <slot />
  </section>
</template>

<script setup>
// Pass through all attributes to the section element
defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>