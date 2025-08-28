<template>
  <div class="sidebar-brand" @click="handleBrandClick">
    <div class="brand-icon">
      <img :src="logo" alt="" />
    </div>
    <div 
      class="brand-label"
      v-if="!collapsed"
      :aria-hidden="collapsed ? 'true' : 'false'"
    >
      Trickster
    </div>
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
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  column-gap: 12px;
  padding-left: var(--left-gutter);
  padding-right: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 64px;
  align-items: center;
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

.brand-label {
  font-size: 1.5rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: width 200ms ease, opacity 200ms ease;
}

/* Subtle logo hover effect when collapsed */
.sidebar--collapsed .sidebar-brand:hover .brand-icon {
  filter: brightness(1.1) saturate(1.2);
}

/* Minimal wordmark effect when expanded */
.sidebar:not(.sidebar--collapsed) .sidebar-brand:hover .brand-label {
  color: var(--c-text-accent, var(--accent));
}

/* Text fade effect during collapse */
.sidebar--collapsing .brand-label {
  mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
}

/* Focus state */
.sidebar-brand:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--row-radius);
}

/* NO big button backgrounds - just subtle effects */

@media (prefers-reduced-motion: reduce) {
  .brand-icon,
  .brand-label {
    transition: opacity 120ms ease;
  }
}
</style>