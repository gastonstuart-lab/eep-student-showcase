import type { ContentItemInput } from '../../../types'
import type { ContentWizardStep, PublishingChoice } from './contentWizardModel'

export type WizardErrors = Record<string, string>

export function isValidUrl(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isPastDate(value: string, now = new Date()) {
  if (!value) return false
  const date = new Date(`${value}T23:59:59`)
  return Number.isNaN(date.getTime()) ? true : date < now
}

export function validateWizardStep(
  step: ContentWizardStep,
  draft: ContentItemInput,
  options: {
    publishingChoice: PublishingChoice
    canPublish: boolean
    destinationCount: number
    now?: Date
  },
): WizardErrors {
  const errors: WizardErrors = {}

  if (step === 'type' && !draft.type) {
    errors.type = 'Choose a content type.'
  }

  if (step === 'type' && options.destinationCount > 1 && !draft.sectionId) {
    errors.sectionId = 'Choose a destination hub.'
  }

  if (step === 'essentials' || step === 'review') {
    if (!draft.title.trim()) errors.title = 'Add a title.'
    if (draft.title.length > 120) errors.title = 'Keep the title to 120 characters or fewer.'
    if (!draft.summary.trim()) errors.summary = 'Add a short summary.'
    if (draft.summary.length > 220) errors.summary = 'Keep the summary to 220 characters or fewer.'
    if (draft.type !== 'link' && draft.type !== 'resource' && !draft.body.trim()) {
      errors.body = 'Add a short description.'
    }
  }

  if (step === 'media' || step === 'review') {
    if (draft.imageUrl && !isValidUrl(draft.imageUrl)) errors.imageUrl = 'Use a valid image URL.'
    if (draft.mediaUrl && !isValidUrl(draft.mediaUrl)) errors.mediaUrl = 'Use a valid video URL.'
    if (draft.linkUrl && !isValidUrl(draft.linkUrl)) errors.linkUrl = 'Use a valid URL.'
    if (draft.actionUrl && !isValidUrl(draft.actionUrl)) errors.actionUrl = 'Use a valid CTA URL.'
    if ((draft.type === 'link' || draft.type === 'resource') && !(draft.linkUrl || draft.actionUrl)) {
      errors.linkUrl = 'Add the destination URL.'
    }
    if (draft.type === 'video' && !draft.mediaUrl) {
      errors.mediaUrl = 'Add the video URL.'
    }
  }

  if (step === 'publishing' || step === 'review') {
    if (options.destinationCount < 1) errors.sectionId = 'No permitted destination hub is available.'
    if (options.publishingChoice !== 'draft' && !options.canPublish) {
      errors.status = 'This account can save drafts but cannot publish or schedule.'
    }
    if (options.publishingChoice === 'scheduled') {
      if (!draft.publishDate) {
        errors.publishDate = 'Choose a schedule date.'
      } else if (isPastDate(draft.publishDate, options.now)) {
        errors.publishDate = 'Choose today or a future date.'
      }
    }
    if (draft.type === 'event' && draft.eventDate && isPastDate(draft.eventDate, options.now)) {
      errors.eventDate = 'Choose today or a future event date.'
    }
  }

  return errors
}

export function hasErrors(errors: WizardErrors) {
  return Object.keys(errors).length > 0
}
