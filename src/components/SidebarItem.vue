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
  z-index: 0; /* подложки ниже контента */
}

.sidebar-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1; /* контент выше подложек */
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
  position: relative;
  z-index: 1; /* контент выше подложек */
}

/* ================================
   Unified hit-area overlay (::before)
   — smoothly morphs circle ↔ pill
   ================================ */
.sidebar-item::before {
  /* visible states */
  opacity: 0;
  background: var(--hover-bg);

  /* geometry via vars (animates on collapse/expand) */
  content: "";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: var(--hit-diameter, calc(var(--icon-size) + 12px));
  left: var(--hit-left, calc(var(--icon-axis-x) - (var(--hit-diameter, calc(var(--icon-size) + 12px)) / 2)));
  right: var(--hit-right, auto);
  width: var(--hit-width, var(--hit-diameter, calc(var(--icon-size) + 12px)));
  border-radius: var(--hit-radius, 9999px);

  pointer-events: none; /* подложка не перехватывает клики */
  z-index: 0;

  transition:
    opacity 200ms ease,
    left 220ms ease,
    right 220ms ease,
    width 220ms ease,
    border-radius 220ms ease;
}

/* show overlay on hover/active */
.sidebar-item:hover::before,
.sidebar-item--active::before {
  opacity: 1;
}

/* -------- Collapsed (CIRCLE) -------- */
.sidebar--collapsed .sidebar-item::before {
  /* circle centered on icon, diameter = icon-size + 12px  */
  --hit-diameter: calc(var(--icon-size) + 12px);
  --hit-left: calc(var(--icon-axis-x) - (var(--hit-diameter) / 2));
  --hit-right: auto;
  --hit-width: var(--hit-diameter);
  --hit-radius: 9999px;
}

/* -------- Expanded (PILL) -------- */
.sidebar:not(.sidebar--collapsed) .sidebar-item::before {
  /* left edge EXACTLY matches collapsed circle's left edge */
  --hit-diameter: calc(var(--icon-size) + 12px);
  --hit-left: calc(var(--icon-axis-x) - (var(--hit-diameter) / 2));
  --hit-right: 16px;                 /* совпадает с padding-right */
  --hit-width: auto;                 /* растягиваемся до right */
  --hit-radius: calc(var(--hit-diameter) / 2); /* полукруглые торцы, как у круга */
}

/* Focus ring that follows the same morphing geometry (::after) */
.sidebar-item:focus-visible {
  outline: none;
}
.sidebar-item:focus-visible::after {
  content: "";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  height: var(--hit-diameter, calc(var(--icon-size) + 12px));
  left: var(--hit-left, calc(var(--icon-axis-x) - (var(--hit-diameter, calc(var(--icon-size) + 12px)) / 2)));
  right: var(--hit-right, auto);
  width: var(--hit-width, var(--hit-diameter, calc(var(--icon-size) + 12px)));
  border-radius: var(--hit-radius, 9999px);

  box-shadow: 0 0 0 2px var(--focus-ring) inset;
  pointer-events: none;
  z-index: 0;

  transition:
    left 220ms ease,
    right 220ms ease,
    width 220ms ease,
    border-radius 220ms ease;
}

/* Active/hover color */
.sidebar-item--active,
.sidebar-item:hover {
  color: var(--c-text-accent, var(--accent));
}

/* Text fade while collapsing (оставляем как было) */
.sidebar--collapsing .sidebar-label {
  mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black calc(100% - 16px), transparent 100%);
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .sidebar-item,
  .sidebar-item::before,
  .sidebar-item::after,
  .sidebar-label {
    transition: opacity 120ms ease !important;
  }
}
</style>
