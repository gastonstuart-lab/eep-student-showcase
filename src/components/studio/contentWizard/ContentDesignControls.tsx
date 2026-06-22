import type { ContentItemInput } from '../../../types'
import {
  contentAccentStyleLabels,
  contentAccentStyles,
  contentImagePlacementLabels,
  contentImagePlacements,
  contentTextAlignmentLabels,
  contentTextAlignments,
  contentWidthLabels,
  contentWidthOptions,
} from '../../../utils/contentAppearance'
import {
  contentExpiryActionLabels,
  contentExpiryActions,
  contentPlacementLabels,
  contentPlacements,
  contentTemplateLabels,
  contentTemplates,
} from '../../../utils/contentLifecycle'

interface Props {
  draft: ContentItemInput
  onChange: (patch: Partial<ContentItemInput>) => void
}

export function ContentDesignControls({ draft, onChange }: Props) {
  return (
    <div className="content-design-controls">
      <fieldset>
        <legend>Card style and size</legend>
        <div className="content-choice-grid">
          {contentWidthOptions.map((width) => (
            <label className={draft.contentWidth === width ? 'content-choice-card is-selected' : 'content-choice-card'} key={width}>
              <input
                checked={draft.contentWidth === width}
                name="content-width"
                onChange={() => onChange({ contentWidth: width })}
                type="radio"
                value={width}
              />
              <strong>{contentWidthLabels[width]}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Where should this appear?</legend>
        <div className="content-choice-grid">
          {contentPlacements.map((placement) => (
            <label className={draft.placement === placement ? 'content-choice-card is-selected' : 'content-choice-card'} key={placement}>
              <input
                checked={draft.placement === placement}
                name="content-placement"
                onChange={() => onChange({ placement })}
                type="radio"
                value={placement}
              />
              <strong>{contentPlacementLabels[placement]}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Feature emphasis</legend>
        <div className="content-choice-grid">
          {contentAccentStyles.map((accentStyle) => (
            <label className={draft.accentStyle === accentStyle ? 'content-choice-card is-selected' : 'content-choice-card'} key={accentStyle}>
              <input
                checked={draft.accentStyle === accentStyle}
                name="content-accent-style"
                onChange={() => onChange({ accentStyle })}
                type="radio"
                value={accentStyle}
              />
              <strong>{contentAccentStyleLabels[accentStyle]}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Choose a layout template</legend>
        <div className="content-choice-grid content-choice-grid--templates">
          {contentTemplates.map((template) => (
            <label className={draft.template === template ? 'content-choice-card is-selected' : 'content-choice-card'} key={template}>
              <input
                checked={draft.template === template}
                name="content-template"
                onChange={() => onChange({ template })}
                type="radio"
                value={template}
              />
              <span className={`content-template-thumbnail content-template-thumbnail--${template}`} aria-hidden="true" />
              <strong>{contentTemplateLabels[template]}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Image and text layout</legend>
        <div className="content-design-row">
          <label>
            <span>Image treatment</span>
            <select value={draft.imagePlacement} onChange={(event) => onChange({ imagePlacement: event.target.value as ContentItemInput['imagePlacement'] })}>
              {contentImagePlacements.map((placement) => (
                <option key={placement} value={placement}>{contentImagePlacementLabels[placement]}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Text alignment</span>
            <select value={draft.textAlignment} onChange={(event) => onChange({ textAlignment: event.target.value as ContentItemInput['textAlignment'] })}>
              {contentTextAlignments.map((alignment) => (
                <option key={alignment} value={alignment}>{contentTextAlignmentLabels[alignment]}</option>
              ))}
            </select>
          </label>
          <label className="content-inline-checkbox">
            <input checked={draft.hideImage ?? false} onChange={(event) => onChange({ hideImage: event.target.checked })} type="checkbox" />
            <span>Hide image on card</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Optional Traditional Chinese fields</legend>
        <div className="content-design-row">
          <label>
            <span>Button label (Traditional Chinese)</span>
            <input value={draft.actionLabelZh ?? ''} onChange={(event) => onChange({ actionLabelZh: event.target.value })} placeholder="例如：了解更多" />
          </label>
          <label>
            <span>Badge text (Traditional Chinese)</span>
            <input value={draft.badgeTextZh ?? ''} onChange={(event) => onChange({ badgeTextZh: event.target.value })} placeholder="例如：最新" />
          </label>
          <label>
            <span>Image description (Traditional Chinese)</span>
            <input value={draft.imageAltZh ?? ''} onChange={(event) => onChange({ imageAltZh: event.target.value })} placeholder="例如：路思義教堂外觀" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>When this content expires</legend>
        {contentExpiryActions.map((action) => (
          <label key={action}>
            <input
              checked={(draft.expiryAction ?? 'hide') === action}
              name="content-expiry-action"
              onChange={() => onChange({ expiryAction: action })}
              type="radio"
              value={action}
            />
            <span>{contentExpiryActionLabels[action]}</span>
          </label>
        ))}
      </fieldset>
    </div>
  )
}
