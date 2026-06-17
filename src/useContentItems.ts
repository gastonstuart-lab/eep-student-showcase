/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { watchAllPublishedContentItems, watchContentItems } from './data'
import { isFirebaseConfigured } from './firebase'
import type { ContentItem, ContentStatus } from './types'

export function useContentItems(sectionId: string, status?: ContentStatus) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    setLoading(true)
    const unsubscribe = watchContentItems(
      sectionId,
      (nextContentItems) => {
        setContentItems(nextContentItems)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
      status,
    )

    return unsubscribe
  }, [sectionId, status])

  return { contentItems, loading, error }
}

export function useAllPublishedContentItems() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    setLoading(true)
    const unsubscribe = watchAllPublishedContentItems(
      (nextContentItems) => {
        setContentItems(nextContentItems)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return { contentItems, loading, error }
}
