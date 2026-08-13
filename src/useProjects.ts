/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from './firebase'
import { watchProjects } from './data'
import type { Project, ProjectStatus } from './types'
import { firestoreInitialLoadTimeoutMessage, firestoreInitialLoadTimeoutMs } from './utils/firestoreStatus'

export function useProjects(status?: ProjectStatus, enabled = true, sectionId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured && enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured || !enabled) {
      setProjects([])
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
    const unsubscribe = watchProjects(
      (nextProjects) => {
        window.clearTimeout(timeout)
        setProjects(nextProjects)
        setLoading(false)
      },
      (watchError) => {
        window.clearTimeout(timeout)
        setError(watchError.message)
        setLoading(false)
      },
      status,
      sectionId,
    )

    return () => {
      window.clearTimeout(timeout)
      unsubscribe()
    }
  }, [enabled, status, sectionId])

  return { projects, loading, error }
}
