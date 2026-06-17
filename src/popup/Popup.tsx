import { useEffect, useState } from 'react'
import type { AnalysisReport, AnalysisResponse } from '../shared/types'

// ─── Status Types ─────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Popup() {
  const [status, setStatus]   = useState<Status>('idle')
  const [report, setReport]   = useState<AnalysisReport | null>(null)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    analyzeCurrentPage()
  }, [])

  async function analyzeCurrentPage() {
    setStatus('loading')
    setError(null)

    try {
      // Step 1: Find the active tab
      // We need its ID to target our message correctly
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab?.id) {
        throw new Error('No active tab found')
      }

      // Step 2: Send message to the content script on that tab
      // This is the core of message passing —
      // chrome.tabs.sendMessage targets a SPECIFIC tab's content script
      const response: AnalysisResponse = await chrome.tabs.sendMessage(
        tab.id,
        { type: 'ANALYZE_PAGE' }
      )

      // Step 3: Handle the response
      if (response.success && response.data) {
        setReport(response.data)
        setStatus('success')
      } else {
        throw new Error(response.error ?? 'Analysis failed')
      }

    } catch (err) {
      // Common cause: content script not yet injected on this tab
      // (e.g. chrome:// pages, extension pages, or page not loaded)
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to page'
      )
      setStatus('error')
    }
  }

  return (
    <div className="bg-gray-950 text-white min-h-[500px] p-4 font-mono">
      <Header onRefresh={analyzeCurrentPage} />

      <div className="space-y-3">
        {status === 'loading' && <LoadingState />}
        {status === 'error'   && <ErrorState message={error} />}
        {status === 'success' && report && <ReportView report={report} />}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function Header({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <h1 className="text-lg font-bold tracking-tight">Website X-Ray</h1>
      </div>
      <button
        onClick={onRefresh}
        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
      >
        ↺ Refresh
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
        <p className="text-sm text-gray-400">Analyzing page...</p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="bg-red-950 border border-red-800 rounded-lg p-4">
      <p className="text-xs text-red-400 font-bold mb-1">CONNECTION ERROR</p>
      <p className="text-sm text-red-300">
        {message ?? 'Could not reach content script.'}
      </p>
      <p className="text-xs text-red-500 mt-2">
        Try refreshing the page, then clicking the extension again.
      </p>
    </div>
  )
}

function ReportView({ report }: { report: AnalysisReport }) {
  const { pageInfo } = report

  return (
    <>
      {/* Page Info Card */}
      <div className="bg-gray-900 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-2 tracking-widest">PAGE</p>
        <p className="text-sm text-white font-bold truncate">{pageInfo.title}</p>
        <p className="text-xs text-gray-500 truncate mt-1">{pageInfo.domain}</p>
        <div className="flex gap-2 mt-2">
          <Badge label={pageInfo.protocol.toUpperCase()} color="green" />
        </div>
      </div>

      {/* Detections Placeholder */}
      <div className="bg-gray-900 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-2 tracking-widest">
          TECHNOLOGIES
        </p>
        <p className="text-xs text-gray-600 italic">
          Detection engine arriving in Phase 2...
        </p>
      </div>

      {/* Meta */}
      <div className="text-right">
        <p className="text-xs text-gray-700">
          v{report.analysisVersion} · {new Date(report.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </>
  )
}

function Badge({ label, color }: { label: string; color: 'green' | 'blue' | 'yellow' }) {
  const colors = {
    green:  'bg-green-900 text-green-300',
    blue:   'bg-blue-900 text-blue-300',
    yellow: 'bg-yellow-900 text-yellow-300',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colors[color]}`}>
      {label}
    </span>
  )
}