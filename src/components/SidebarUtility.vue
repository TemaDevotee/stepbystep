<template>
  <div class="sidebar-utility">
    <!-- Icon-only interactive element for non-slotted utilities -->
    <button
      v-if="!$slots.default && icon"
      class="icon"
      :aria-label="ariaLabel"
      :title="title"
      @click="$emit('click', $event)"
      tabindex="0"
    >
      <span class="material-icons" aria-hidden="true">{{ icon }}</span>
    </button>
    
    <!-- Slotted content for complex components like dropdowns -->
    <div v-if="$slots.default" class="utility-slot">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  ariaLabel: String,
  title: String
})

defineEmits(['click'])
</script>

<style scoped>
.sidebar-utility {
  position: relative;
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  padding-left: var(--left-gutter);
  height: var(--row-height);
  align-items: center;
  pointer-events: none; /* Wrapper never captures clicks */
}

/* Icon-only interactive element */
.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  place-items: center;
  pointer-events: auto; /* Only the icon is clickable */
  position: relative;
  cursor: pointer;
  background: transparent;
  border: none;
  color: var(--c-text-muted, var(--text));
  transition: color 200ms ease;
}

.icon .material-icons {
  font-size: 20px;
  line-height: 20px;
}

/* Icon-sized circular hover overlay */
.icon::before {
  content: "";
  position: absolute;
  inset: 0; /* Same as icon rect */
  border-radius: var(--radius-round, 999px);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none; /* overlay only */
}

.icon:hover::before,
.icon:focus-visible::before,
.icon[aria-current="true"]::before {
  opacity: 1;
}

.icon:hover {
  color: var(--c-text-accent, var(--accent));
}

/* Focus ring matches icon circle */
.icon:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-round, 999px);
}

/* Slotted content container */
.utility-slot {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: auto; /* Allow slotted content to be interactive */
}

/* Prevent accidental highlight on utility wrapper */
.sidebar-utility *:not(.icon):not(.utility-slot):not(.utility-slot *) {
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .icon,
  .icon::before {
    transition: opacity 120ms ease;
  }
}
</style>