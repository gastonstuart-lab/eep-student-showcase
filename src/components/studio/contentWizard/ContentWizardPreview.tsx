import { useMemo, useState } from 'react'
import { ContentLayout } from '../../public/ContentLayout'
import type { ContentItem } from '../../../types'

interface Props {
  item: ContentItem
}

export function ContentWizardPreview({ item }: Props) {
  const [mode, setMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showContext, setShowContext] = useState(true)

  const previewItems = useMemo(() => {
    if (!showContext) {
      return [item]
    }

    const peerMain: ContentItem = {
      ...item,
      id: 'preview-peer-main',
      title: 'Neighbouring hub update',
      titleZh: '相鄰學習中心更新',
      summary: 'Shows how your selected card sits inside the full public hub layout.',
      summaryZh: '預覽你的卡片在完整公開學習中心中的實際位置。',
      body: 'This sample helps you judge spacing and visual hierarchy before publishing.',
      bodyZh: '這個範例可協助你在發布前判斷間距與視覺層級。',
      template: 'smallTile',
      contentWidth: 'small',
      placement: 'main',
      displayStyle: 'quickLink',
      accentStyle: 'neutral',
      badgeText: 'Sample',
      badgeTextZh: '範例',
      imageUrl: '',
      hideImage: true,
      actionUrl: '',
      secondaryActionUrl: '',
      ctaStyle: 'hidden',
      actionStyle: 'hidden',
    }

    const peerAnnouncement: ContentItem = {
      ...item,
      id: 'preview-peer-announcement',
      title: 'Daily learning notice',
      titleZh: '每日學習公告',
      summary: 'A compact announcement card for realistic placement context.',
      summaryZh: '用於模擬實際版位情境的精簡公告卡片。',
      body: '',
      bodyZh: '',
      template: 'announcementStrip',
      placement: 'announcement',
      displayStyle: 'banner',
      contentWidth: 'full',
      imageUrl: '',
      hideImage: true,
      ctaStyle: 'hidden',
      actionStyle: 'hidden',
      actionUrl: '',
      secondaryActionUrl: '',
    }

    return [peerAnnouncement, item, peerMain]
  }, [item, showContext])

  return (
    <aside className="content-wizard-preview" aria-label="Public hub preview">
      <div className="preview-controls preview-controls--wizard">
        {(['desktop', 'tablet', 'mobile'] as const).map((value) => (
          <button
            className={mode === value ? 'small-button is-active' : 'small-button'}
            key={value}
            type="button"
            onClick={() => setMode(value)}
          >
            {value}
          </button>
        ))}
        <button className="small-button" type="button" onClick={() => setShowContext((current) => !current)}>
          {showContext ? 'Hide hub context' : 'Show hub context'}
        </button>
      </div>
      <div className={`content-preview-frame live-preview-frame preview-${mode} content-preview-frame-${mode}`}>
        <div className="wizard-preview-shell">
          <header className="wizard-preview-header">
            <strong>Public hub rendering</strong>
            <small>Real card spacing, placement, and template behavior</small>
          </header>
          <ContentLayout items={previewItems} />
        </div>
      </div>
    </aside>
  )
}
