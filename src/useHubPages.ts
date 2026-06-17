/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { watchHubPage, watchHubPages } from './data'
import { isFirebaseConfigured } from './firebase'
import { hubConfigById, hubConfigs, hubPageFromConfig } from './hubs'
import type { HubPage } from './types'

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
    const unsubscribe = watchHubPage(
      sectionId,
      (nextHubPage) => {
        setHubPage(nextHubPage ?? fallback)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
    )

    return unsubscribe
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
    const unsubscribe = watchHubPages(
      (nextHubPages) => {
        const merged = fallback.map((defaultHubPage) => {
          const saved = nextHubPages.find((hubPage) => hubPage.sectionId === defaultHubPage.sectionId)
          return saved ?? defaultHubPage
        })

        setHubPages(merged)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [fallback])

  return { hubPages, loading, error }
}
