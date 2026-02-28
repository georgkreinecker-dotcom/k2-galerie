import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { safeReload } from '../utils/env'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary - Verhindert dass Cursor-Crashes die gesamte App zum Absturz bringen
 * Fängt alle React-Fehler ab und zeigt eine Fehlerseite statt zu crashen
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console but don't crash
    console.error('🚨 Error Boundary gefangen:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Versuche Fehler zu loggen ohne die App zu crashen
    try {
      // Optional: Hier könntest du Fehler an einen Service senden
      // fetch('/api/errors', { method: 'POST', body: JSON.stringify({ error, errorInfo }) })
    } catch (e) {
      // Ignoriere Fehler beim Logging
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      this.handleReset()
      return
    }
    safeReload()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          padding: '2rem',
          color: 'white',
          background: '#1a1a1a',
          minHeight: '100vh',
          fontFamily: 'system-ui',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>
            ⚠️ Fehler abgefangen
          </h1>
          <p style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
            Die App hat einen Fehler erkannt, aber läuft weiter.<br />
            Dies verhindert einen vollständigen Absturz.
          </p>
          
          {this.state.error && (
            <details style={{
              background: '#000',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '800px',
              overflow: 'auto'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Fehler-Details anzeigen
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Erneut versuchen
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔃 Seite neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
