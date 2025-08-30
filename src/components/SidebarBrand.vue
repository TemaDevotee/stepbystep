<template>
  <div class="sidebar-brand">
    <!-- кликается только логотип -->
    <button
      class="brand-icon"
      type="button"
      @click="handleBrandClick"
      aria-label="Go to dashboard"
    >
      <img :src="logo" alt="" />
    </button>

    <!-- правая часть строки — пустая, некликабельная -->
    <div class="brand-spacer" aria-hidden="true"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  collapsed: Boolean,
  logo: String
})

const emit = defineEmits(['expand', 'navigate'])

const handleBrandClick = () => {
  if (props.collapsed) emit('expand')
  else emit('navigate')
}
</script>

<style scoped>
.sidebar-brand {
  position: relative;
  display: grid;
  /* НЕ меняем сетку: колонка иконки как была */
  grid-template-columns: var(--icon-size) 1fr;
  padding-left: var(--left-gutter);
  padding-top: 16px;
  padding-bottom: 16px;
  height: 64px;
  align-items: center;

  cursor: default; /* кликается только кнопка */
  text-decoration: none;
  color: inherit;
}

/* Кнопка ровно размера колонки; без padding/margin — layout не меняем */
.brand-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  place-items: center;
  position: relative;
  overflow: visible; /* чтобы псевдоэлемент мог выходить за границы */

  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: pointer;

  border-radius: 9999px;
  z-index: 0;
}

/* Увеличенная круглая hit-area и hover-подложка ПОД логотипом.
   Выходит за границы кнопки, не влияя на размеры. */
.brand-icon::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--icon-size) + 12px);   /* +6px вокруг, подстрой при желании */
  height: calc(var(--icon-size) + 12px);
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: var(--hover-bg, rgba(255, 255, 255, 0.08));
  opacity: 0;
  transition: opacity 160ms ease;
  /* важно: позволяет «ловить» hover/click за пределами исходной кнопки */
  pointer-events: auto;
  z-index: 0; /* ниже картинки */
}

/* Подсветка при наведении/фокусе */
.brand-icon:hover::before,
.brand-icon:focus-visible::before {
  opacity: 1;
}

/* Логотип — фиксированный размер и поверх подложки */
.brand-icon img {
  height: 20px;          /* фиксируем реальный размер */
  width: auto;
  display: block;
  position: relative;
  z-index: 1;
  pointer-events: none;  /* чтобы hover считывался и рядом с логотипом */
}

/* Фокус-рамка по круглой зоне кнопки */
.brand-icon:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Правая зона некликабельна */
.brand-spacer {
  height: 100%;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .brand-icon::before { transition: opacity 120ms ease; }
}
</style>
