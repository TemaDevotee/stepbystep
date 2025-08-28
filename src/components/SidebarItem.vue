<template>
  <router-link
    :to="item.to"
    :class="[
      'sidebar-item',
      {
        'sidebar-item--active': isActive,
        'sidebar-item--collapsed': collapsed
      }
    ]"
    :title="collapsed ? label : ''"
    :aria-current="isActive ? 'page' : undefined"
  >
    <div class="sidebar-icon">
      <span class="material-icons" aria-hidden="true">{{ item.icon }}</span>
    </div>
    <div 
      class="sidebar-label"
      v-if="!collapsed"
      :aria-hidden="collapsed ? 'true' : 'false'"
    >
      {{ label }}
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  collapsed: Boolean,
  item: {
    type: Object,
    required: true
  },
  isActive: Boolean,
  label: String
})
</script>

<style scoped>
.sidebar-item {
  position: relative;
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  column-gap: 12px;
  padding-left: var(--left-gutter);
  padding-right: 16px;
  height: var(--row-height);
  align-items: center;
  text-decoration: none;
  color: var(--c-text-primary);
  font-weight: 500;
  border-radius: var(--row-radius);
  transition: color 200ms ease;
}

.sidebar-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-icon .material-icons {
  font-size: 20px;
  line-height: 20px;
}

.sidebar-label {
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: width 200ms ease, opacity 200ms ease;
}

/* Pill hover geometry when expanded */\n.sidebar:not(.sidebar--collapsed) .sidebar-item::before {
  content: \"\";
  position: absolute;
  inset: 0;
  border-radius: var(--row-radius);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}

.sidebar:not(.sidebar--collapsed) .sidebar-item:hover::before,
.sidebar:not(.sidebar--collapsed) .sidebar-item--active::before {
  opacity: 1;
}

/* Circle hover geometry when collapsed */
.sidebar--collapsed .sidebar-item::before {
  content: \"\";
  position: absolute;
  left: var(--icon-axis-x);
  top: 50%;
  translate: -50% -50%;
  width: var(--row-height);
  height: var(--row-height);
  border-radius: 50%;
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}

.sidebar--collapsed .sidebar-item:hover::before,
.sidebar--collapsed .sidebar-item--active::before {
  opacity: 1;
}

/* Active state styling */
.sidebar-item--active {
  color: var(--c-text-accent, var(--accent));
}

.sidebar-item:hover {
  color: var(--c-text-accent, var(--accent));
}

/* Text fade effect during collapse */
.sidebar--collapsing .sidebar-label {
  mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
}

/* Focus rings that match geometry */
.sidebar:not(.sidebar--collapsed) .sidebar-item:focus-visible::after {
  content: \"\";
  position: absolute;
  inset: 0;
  border-radius: var(--row-radius);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.sidebar--collapsed .sidebar-item:focus-visible::after {
  content: \"\";
  position: absolute;
  left: var(--icon-axis-x);
  top: 50%;
  translate: -50% -50%;
  width: var(--row-height);
  height: var(--row-height);
  border-radius: 50%;
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-item,
  .sidebar-item::before,
  .sidebar-item::after,
  .sidebar-label {
    transition: opacity 120ms ease;
  }
}
</style>