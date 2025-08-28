<template>
  <div class="sidebar-brand" @click="handleBrandClick">
    <div class="brand-icon">
      <img :src="logo" alt="" />
    </div>
    <!-- Wordmark hidden as per design requirements -->
  </div>
</template>

<script setup>
const props = defineProps({
  collapsed: Boolean,
  logo: String
})

const emit = defineEmits(['expand', 'navigate'])

const handleBrandClick = () => {
  if (props.collapsed) {
    emit('expand')
  } else {
    emit('navigate')
  }
}
</script>

<style scoped>
.sidebar-brand {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: var(--left-gutter);
  padding-right: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 64px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.brand-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: filter 200ms ease;
}

.brand-icon img {
  height: 20px;
  width: auto;
  display: block;
}

/* Subtle logo hover effect */
.sidebar-brand:hover .brand-icon {
  filter: brightness(1.1) saturate(1.2);
}

/* Focus state */
.sidebar-brand:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--row-radius);
}

@media (prefers-reduced-motion: reduce) {
  .brand-icon {
    transition: filter 120ms ease;
  }
}
</style>