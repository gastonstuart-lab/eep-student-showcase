import type { ReactNode } from 'react'

export function ScrollReveal({
  as: Component = 'div',
  className = '',
  stagger = false,
  children,
}: {
  as?: 'div' | 'section'
  className?: string
  stagger?: boolean
  children: ReactNode
}) {
  return <Component className={`reveal${stagger ? ' reveal-stagger' : ''}${className ? ` ${className}` : ''}`}>{children}</Component>
}
