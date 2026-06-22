import { ContentCard } from './ContentCard'
import type { ContentItem, ContentPlacement } from '../../types'

const placementOrder: ContentPlacement[] = ['hero', 'announcement', 'featured', 'main', 'sidebar']

function normalizedPlacement(item: ContentItem): ContentPlacement {
  if (item.placement) return item.placement
  if (item.displayStyle === 'banner') return 'announcement'
  if (item.featured || item.displayStyle === 'featured') return 'featured'
  return 'main'
}

function rowClassFor(item: ContentItem) {
  const template = item.template

  if (template === 'fullHero' || template === 'wideBanner' || template === 'announcementStrip') {
    return 'content-layout-row content-layout-row-full'
  }

  if (template === 'largeFeature' || template === 'imageLeft' || template === 'imageRight') {
    return 'content-layout-row content-layout-row-wide'
  }

  if (template === 'smallTile' || template === 'sidebarNotice') {
    return 'content-layout-row content-layout-row-three'
  }

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
  const grouped = placementOrder
    .map((placement) => ({ placement, items: items.filter((item) => normalizedPlacement(item) === placement) }))
    .filter((group) => group.items.length > 0)

  return (
    <div className={`content-list content-layout${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}>
      {grouped.map((group) => (
        <section className={`content-placement content-placement-${group.placement}`} data-placement={group.placement} key={group.placement}>
          <div className={`content-placement-grid content-placement-grid-${group.placement}`}>
            {group.items.map((item) => (
              <div className={rowClassFor(item)} key={item.id}>
                <ContentCard compact={compact} item={item} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
