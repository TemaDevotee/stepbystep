<template>
  <div
    :class="[
      'sidebar-utility',
      { 'sidebar-utility--clickable': !$slots.default }
    ]"
    :aria-label="ariaLabel"
    :title="title"
    @click="handleClick"
    tabindex="0"
    role="button"
  >
    <div class="utility-icon">
      <span class="material-icons" aria-hidden="true">{{ icon }}</span>
    </div>
    
    <!-- Hidden slotted content for complex components -->
    <div v-if="$slots.default" class="utility-slot">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useSlots } from 'vue'

defineProps({
  icon: String,
  ariaLabel: String,
  title: String
})

const emit = defineEmits(['click'])
const slots = useSlots()

const handleClick = (event) => {
  // Only emit click if there's no slotted content
  // Slotted content will handle its own clicks
  if (!slots.default) {
    emit('click', event)
  }
}
</script>

<style scoped>
.sidebar-utility {
  position: relative;
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  column-gap: 12px;
  padding-left: var(--left-gutter);
  padding-right: 16px;
  height: var(--row-height);
  align-items: center;
  cursor: pointer;
  color: var(--c-text-muted, var(--text));
  transition: color 200ms ease;
}

.sidebar-utility--clickable {
  cursor: pointer;
}

.utility-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

.utility-icon .material-icons {
  font-size: 20px;
  line-height: 20px;
}

.utility-content {
  display: flex;
  align-items: center;
}

/* Always circular hover geometry for utilities */
.sidebar-utility::before {
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

.sidebar-utility:hover::before {
  opacity: 1;
}

.sidebar-utility:hover {
  color: var(--c-text-accent, var(--accent));
}

/* Focus ring */
.sidebar-utility:focus-visible::after {
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

/* When utility has slotted content, make the utility non-clickable 
   and let the slotted content handle interactions */
.sidebar-utility--has-slot {
  cursor: default;
  pointer-events: none;
}

.sidebar-utility--has-slot .utility-content {
  pointer-events: auto;
}

/* Override slotted component styles to match our geometry */
.sidebar-utility :deep(button) {
  position: absolute !important;
  left: var(--icon-axis-x) !important;
  top: 50% !important;
  translate: -50% -50% !important;
  width: var(--row-height) !important;
  height: var(--row-height) !important;
  border-radius: 50% !important;
  background: transparent !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  transition: background-color 200ms ease !important;
}

.sidebar-utility :deep(button:hover) {
  background-color: var(--hover-bg) !important;
  color: var(--c-text-accent, var(--accent)) !important;
}

.sidebar-utility :deep(.material-icons),
.sidebar-utility :deep(.material-icons-outlined) {
  font-size: 20px !important;
  line-height: 20px !important;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-utility,
  .sidebar-utility::before,
  .sidebar-utility::after {
    transition: opacity 120ms ease;
  }
}
</style>