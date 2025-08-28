import { reactive } from 'vue';

// Utility functions for theme handling
function resolveInitialTheme() {
  const fromDom = document.documentElement.getAttribute('data-theme')
  const fromOldStore = localStorage.getItem('appTheme')
  const fromNewStore = localStorage.getItem('app:theme')
  
  // Priority: DOM > new storage > old storage > default
  const candidate = fromDom || fromNewStore || fromOldStore || 'classic'
  return candidate === 'sapphire' ? 'sapphire' : 'classic'
}

function applyTheme(theme) {
  if (theme !== 'classic' && theme !== 'sapphire') {
    theme = 'classic' // fallback
  }
  
  document.documentElement.setAttribute('data-theme', theme)
  document.body.dataset.theme = theme // for backwards compatibility
  
  try {
    localStorage.setItem('app:theme', theme)
    // Clean up old storage key
    localStorage.removeItem('appTheme')
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
  
  return theme
}

/**
 * Reactive store for theme and dark mode.  The user can select among
 * Classic and Sapphire themes and toggle dark mode.  Theme preferences 
 * persist in localStorage under 'app:theme' and dark mode under 'isDarkMode'.
 */
export const themeStore = reactive({
  currentTheme: 'classic',
  isDarkMode: localStorage.getItem('isDarkMode') === 'true',
  
  // Available colour palettes - only expose Classic and Sapphire
  themes: [
    { id: 'classic', name: 'Classic' },
    { id: 'sapphire', name: 'Sapphire' }
  ],
  
  setTheme(themeId) {
    const appliedTheme = applyTheme(themeId)
    this.currentTheme = appliedTheme
    return appliedTheme
  },
  
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', this.isDarkMode);
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  },
  
  init() {
    // Initialize theme
    const initialTheme = resolveInitialTheme()
    this.currentTheme = applyTheme(initialTheme)
    
    // Initialize dark mode
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
});

// Initialize theme before export
themeStore.init();

export default themeStore;
