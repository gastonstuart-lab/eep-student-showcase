import type { ContentItemInput } from '../../../types'
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
