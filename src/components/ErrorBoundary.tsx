import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

type ErrorBoundaryProps = {
  children: ReactNode
  resetKey: string
}

type ErrorBoundaryState = {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MzikTV render error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="section-shell bg-black text-white">
          <div className="mx-auto max-w-xl border border-white/20 p-8 text-center">
            <p className="text-sm font-semibold uppercase text-white/55">Something went wrong</p>
            <h1 className="mt-4 text-4xl font-semibold uppercase leading-none">This page needs a refresh</h1>
            <p className="mt-4 text-sm leading-6 text-white/65">
              The app hit a rendering issue. Return to events and try the flow again.
            </p>
            <Button className="mt-6" to="/events" variant="light">
              Browse events
            </Button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
