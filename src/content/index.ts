import type { AnalyzePageMessage, AnalysisResponse, AnalysisReport, PageInfo } from '../shared/types'

// ─── Page Info Collector ──────────────────────────────────────────
// This is the first real "analyzer" — it reads basic facts
// about the page from the browser environment.

function collectPageInfo(): PageInfo {
  const url = new URL(window.location.href)

  return {
    url: window.location.href,
    title: document.title,
    domain: url.hostname,
    protocol: url.protocol.replace(':', ''),  // 'https' not 'https:'
    path: url.pathname,
  }
}

// ─── Main Analysis Runner ─────────────────────────────────────────
// This will grow significantly in Phase 2.
// For now it just collects page info.
// The structure here is intentional — it will hold all detectors.

function runAnalysis(): AnalysisReport {
  const pageInfo = collectPageInfo()

  return {
    pageInfo,
    detections: [],   // Phase 2 fills this
    timestamp: Date.now(),
    analysisVersion: '0.1.0',
  }
}

// ─── Message Listener ─────────────────────────────────────────────
// This is the "server" — it listens for requests from the popup.
// The return true at the end is CRITICAL — it tells Chrome
// this listener will respond asynchronously.

chrome.runtime.onMessage.addListener(
  (message: AnalyzePageMessage, _sender: any, sendResponse: (response?: AnalysisResponse) => void) => {

    if (message.type === 'ANALYZE_PAGE') {
      try {
        const report = runAnalysis()

        const response: AnalysisResponse = {
          success: true,
          data: report,
        }

        sendResponse(response)
      } catch (err) {
        const response: AnalysisResponse = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }

        sendResponse(response)
      }
    }

    // CRITICAL: return true = "I will call sendResponse later (or now)"
    // Without this, the message channel closes before the response sends.
    return true
  }
)

console.log('[Website X-Ray] Content script ready on:', window.location.href)