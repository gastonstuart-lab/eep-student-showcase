/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { watchAllPublishedContentItems, watchContentItems } from './data'
import { isFirebaseConfigured } from './firebase'
import type { ContentItem, ContentStatus } from './types'
import { isPubliclyVisibleContent } from './utils/contentLifecycle'
import { firestoreInitialLoadTimeoutMessage, firestoreInitialLoadTimeoutMs } from './utils/firestoreStatus'

export function useContentItems(sectionId: string, status?: ContentStatus, enabled = true) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured && enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !enabled) {
      setContentItems([])
      setLoading(false)
      setError('')
      return undefined
    }

    setLoading(true)
    setError('')
    const timeout = window.setTimeout(() => {
      setError(firestoreInitialLoadTimeoutMessage())
      setLoading(false)
    }, firestoreInitialLoadTimeoutMs)
    const unsubscribe = watchContentItems(
      sectionId,
      (nextContentItems) => {
        window.clearTimeout(timeout)
        setContentItems(nextContentItems)
        setLoading(false)
      },
      (watchError) => {
        window.clearTimeout(timeout)
        setError(watchError.message)
        setLoading(false)
      },
      status,
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [enabled, sectionId, status])

  return { contentItems, loading, error }
}

export function useAllPublishedContentItems() {
  const [sourceItems, setSourceItems] = useState<ContentItem[]>([])
  const [now, setNow] = useState(() => new Date())
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    setLoading(true)
    setError('')
    const timeout = window.setTimeout(() => {
      setError(firestoreInitialLoadTimeoutMessage())
      setLoading(false)
    }, firestoreInitialLoadTimeoutMs)
    const unsubscribe = watchAllPublishedContentItems(
      (nextContentItems) => {
        window.clearTimeout(timeout)
        setSourceItems(nextContentItems)
        setLoading(false)
      },
      (watchError) => {
        window.clearTimeout(timeout)
        setError(watchError.message)
        setLoading(false)
      },
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const contentItems = useMemo(
    () => sourceItems.filter((item) => isPubliclyVisibleContent(item, now)),
    [now, sourceItems],
  )

  return { contentItems, loading, error }
}
