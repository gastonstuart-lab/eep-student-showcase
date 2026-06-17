/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from './firebase'
import { watchProjects } from './data'
import type { Project, ProjectStatus } from './types'

export function useProjects(status?: ProjectStatus) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    setLoading(true)
    const unsubscribe = watchProjects(
      (nextProjects) => {
        setProjects(nextProjects)
        setLoading(false)
      },
      (watchError) => {
        setError(watchError.message)
        setLoading(false)
      },
      status,
    )

    return unsubscribe
  }, [status])

  return { projects, loading, error }
}
