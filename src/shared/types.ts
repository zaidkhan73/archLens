// ─── Message Types ────────────────────────────────────────────────
// These are the "API endpoints" of your extension.
// Every message has a type so the receiver knows what to do.

export type MessageType = 'ANALYZE_PAGE' | 'ANALYSIS_COMPLETE'

export interface Message {
  type: MessageType
}

export interface AnalyzePageMessage extends Message {
  type: 'ANALYZE_PAGE'
}

// ─── Data Shapes ──────────────────────────────────────────────────

export interface PageInfo {
  url: string
  title: string
  domain: string
  protocol: string
  path: string
}

export interface DetectionResult {
  name: string
  category: 'framework' | 'hosting' | 'cdn' | 'analytics' | 'auth' | 'other'
  detected: boolean
  confidence: 'high' | 'medium' | 'low'
  evidence: string[]
  explanation: string
}

export interface AnalysisReport {
  pageInfo: PageInfo
  detections: DetectionResult[]
  timestamp: number
  analysisVersion: string
}

// ─── Response Shape ───────────────────────────────────────────────

export interface AnalysisResponse {
  success: boolean
  data?: AnalysisReport
  error?: string
}