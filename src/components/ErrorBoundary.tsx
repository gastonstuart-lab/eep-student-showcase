import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Application error boundary caught an error', error, info)
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <main className="error-boundary-page">
        <section className="page-message error-boundary-panel">
          <p className="eyebrow">Application error</p>
          <h1>Something went wrong</h1>
          <p>Please reload the page. If the problem continues, return to the public hub and try again.</p>
          {import.meta.env.DEV && (
            <pre>{this.state.error.message}</pre>
          )}
          <div className="hero-actions">
            <button className="primary-button blue" type="button" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <Link className="secondary-button" to="/">
              Return home
            </Link>
          </div>
        </section>
      </main>
    )
  }
}
