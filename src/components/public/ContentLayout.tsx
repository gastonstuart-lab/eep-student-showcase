import { ContentCard } from './ContentCard'
import type { ContentItem } from '../../types'

function rowClassFor(item: ContentItem) {
  if (item.contentWidth === 'full' || item.displayStyle === 'banner') {
    return 'content-layout-row content-layout-row-full'
  }

  if (item.layoutColumns === 'one' || item.contentWidth === 'wide' || item.displayStyle === 'featured') {
    return 'content-layout-row content-layout-row-wide'
  }

  if (item.layoutColumns === 'three' || item.contentWidth === 'small' || item.displayStyle === 'quickLink') {
    return 'content-layout-row content-layout-row-three'
  }

  return 'content-layout-row content-layout-row-two'
}

export function ContentLayout({
  items,
  compact = false,
  className = '',
}: {
  items: ContentItem[]
  compact?: boolean
  className?: string
}) {
  return (
    <div className={`content-list content-layout${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <div className={rowClassFor(item)} key={item.id}>
          <ContentCard compact={compact} item={item} />
        </div>
      ))}
    </div>
  )
}
