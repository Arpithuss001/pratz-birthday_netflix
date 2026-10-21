export function enterFullscreen() {
  if (typeof document === 'undefined') return
  try {
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      const el = document.documentElement as any
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
    }
  } catch (err) {
    // Ignore permissions or policy errors
  }
}

export function exitFullscreen() {
  if (typeof document === 'undefined') return
  try {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      const doc = document as any
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {})
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      }
    }
  } catch (err) {
    // Ignore errors
  }
}

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}
