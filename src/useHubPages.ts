/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { watchHubPage, watchHubPages } from './data'
import { isFirebaseConfigured } from './firebase'
import { hubConfigById, hubConfigs, hubPageFromConfig } from './hubs'
import type { HubPage } from './types'
import { firestoreInitialLoadTimeoutMessage, firestoreInitialLoadTimeoutMs } from './utils/firestoreStatus'

export function useHubPage(sectionId: string) {
  const fallback = useMemo(
    () => (hubConfigById[sectionId] ? hubPageFromConfig(hubConfigById[sectionId]) : null),
    [sectionId],
  )
  const [hubPage, setHubPage] = useState<HubPage | null>(fallback)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setHubPage(fallback)
      return undefined
    }

    setLoading(true)
    setError('')
    const timeout = window.setTimeout(() => {
      setError(firestoreInitialLoadTimeoutMessage())
      setLoading(false)
    }, firestoreInitialLoadTimeoutMs)
    const unsubscribe = watchHubPage(
      sectionId,
      (nextHubPage) => {
        window.clearTimeout(timeout)
        setHubPage(nextHubPage ?? fallback)
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
  }, [fallback, sectionId])

  return { hubPage, loading, error }
}

export function useHubPages() {
  const fallback = useMemo(() => hubConfigs.map(hubPageFromConfig), [])
  const [hubPages, setHubPages] = useState<HubPage[]>(fallback)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setHubPages(fallback)
      return undefined
    }

    setLoading(true)
    setError('')
    const timeout = window.setTimeout(() => {
      setError(firestoreInitialLoadTimeoutMessage())
      setLoading(false)
    }, firestoreInitialLoadTimeoutMs)
    const unsubscribe = watchHubPages(
      (nextHubPages) => {
        window.clearTimeout(timeout)
        const merged = fallback.map((defaultHubPage) => {
          const saved = nextHubPages.find((hubPage) => hubPage.sectionId === defaultHubPage.sectionId)
          return saved ?? defaultHubPage
        })

        setHubPages(merged)
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
  }, [fallback])

  return { hubPages, loading, error }
}
