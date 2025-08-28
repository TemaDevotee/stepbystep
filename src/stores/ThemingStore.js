import { reactive } from 'vue';

/**
 * Reactive store for theme and dark mode.  The user can select among
 * six colour palettes and toggle dark mode.  Preferences persist in
 * localStorage under the keys `appTheme` and `isDarkMode`.
 */
export const themeStore = reactive({
  currentTheme: localStorage.getItem('appTheme') || 'classic',
  isDarkMode: localStorage.getItem('isDarkMode') === 'true',
  // Available colour palettes.  Only three themes are exposed to the user:
  // Classic, Graphite and Sapphire.  Additional themes have been removed.
  themes: [
    { id: 'classic', name: 'Classic' },
    { id: 'graphite', name: 'Graphite' },
    { id: 'sapphire', name: 'Sapphire' }
  ],
  setTheme(themeId) {
    this.currentTheme = themeId;
    localStorage.setItem('appTheme', themeId);
    document.body.dataset.theme = themeId;
  },
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', this.isDarkMode);
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  },
  init() {
    document.body.dataset.theme = this.currentTheme;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
});

themeStore.init();

export default themeStore;
