
'use client'

import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { AnimatedProgressBar } from './animated-progress'

interface ResultCardProps {
  title: string
  primaryFinding: string
  confidence: number
  processingTime: number
  severity?: 'Low' | 'Medium' | 'High' | 'Hairline' | 'Stable' | 'Displaced'
  findings?: string[]
  recommendations?: string[]
  diseases?: Record<string, number> // 🔥 NEW
}

const getColor = (value: number) => {
  if (value > 0.7) return 'text-red-500'
  if (value > 0.4) return 'text-yellow-500'
  return 'text-green-500'
}

export default function ResultCard({
  title,
  primaryFinding,
  confidence,
  processingTime,
  severity,
  findings = [],
  recommendations = [],
  diseases = {}
}: ResultCardProps) {
  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-xl p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-sm text-slate-500">AI Diagnosis</span>
      </div>

      {/* PRIMARY RESULT */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
        <p className="text-sm text-slate-500">Primary Finding</p>
        <p className="text-2xl font-bold text-blue-600">{primaryFinding}</p>
      </div>

      {/* CONFIDENCE */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Confidence</span>
          <span>{(confidence * 100).toFixed(1)}%</span>
        </div>
        <AnimatedProgressBar value={confidence * 100} />
      </div>

      {/* 🔥 DISEASE BREAKDOWN */}
      {Object.keys(diseases).length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Disease Probability</h4>
          <div className="space-y-3">
            {Object.entries(diseases).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{key}</span>
                  <span className={getColor(value)}>
                    {(value * 100).toFixed(1)}%
                  </span>
                </div>
                <AnimatedProgressBar value={value * 100} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FINDINGS */}
      {findings.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Additional Findings</h4>
          {findings.map((f, i) => (
            <p key={i} className="text-sm text-slate-600">• {f}</p>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between text-sm text-slate-500 border-t pt-3">
        <span>{processingTime.toFixed(0)} ms</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

