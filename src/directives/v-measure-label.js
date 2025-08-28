// v-measure-label directive for smooth width transitions
export default {
  mounted (el) {
    const setWidth = () => {
      const prev = el.style.width
      el.style.width = 'auto'
      const w = Math.ceil(el.scrollWidth + 1)
      el.style.setProperty('--w', `${w}px`)
      el.style.width = prev || ''
    }
    setWidth()
    const ro = new ResizeObserver(setWidth)
    ro.observe(el)
    el.__ro = ro
  },
  updated (el) {
    const prev = el.style.width
    el.style.width = 'auto'
    const w = Math.ceil(el.scrollWidth + 1)
    el.style.setProperty('--w', `${w}px`)
    el.style.width = prev || ''
  },
  beforeUnmount (el) {
    if (el.__ro) { try { el.__ro.disconnect() } catch (e) {} }
  }
}
