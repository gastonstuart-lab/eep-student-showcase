import { useEffect, type RefObject } from 'react'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true')
}

export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  returnFocusRef,
  onEscape,
  lockScroll = false,
}: {
  active: boolean
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
  onEscape: () => void
  lockScroll?: boolean
}) {
  useEffect(() => {
    if (!active) return undefined

    const returnFocusTarget = returnFocusRef?.current
    const previousOverflow = document.body.style.overflow
    if (lockScroll) {
      document.body.style.overflow = 'hidden'
    }

    const focusTarget = initialFocusRef?.current ?? getFocusable(containerRef.current)[0] ?? containerRef.current
    focusTarget?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusable(containerRef.current)
      if (!focusable.length) {
        event.preventDefault()
        containerRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (lockScroll) {
        document.body.style.overflow = previousOverflow
      }
      returnFocusTarget?.focus()
    }
  }, [active, containerRef, initialFocusRef, lockScroll, onEscape, returnFocusRef])
}
