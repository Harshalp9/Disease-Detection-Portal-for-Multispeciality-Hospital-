
'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import ImageUploader from '@/components/imaging/image-uploader'
import ResultCard from '@/components/imaging/result-card'
import { apiClient, ChestXrayResult } from '@/lib/api-client'
import { Loader, AlertCircle } from 'lucide-react'
import DonutChart from '@/components/imaging/donut-chart'
import DiseaseRadar from '@/components/imaging/radar-chart'

export default function ChestXrayPage() {
  const [result, setResult] = useState<ChestXrayResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelected = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await apiClient.inferChestXray(file)
      setResult(res)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to analyze image'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-hospital-background">
      <DashboardSidebar />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Chest X-ray Analysis"
          subtitle="AI-powered multi-disease detection"
        />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT PANEL */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border shadow-md sticky top-8">

                  <h2 className="text-lg font-bold mb-4">Upload X-ray</h2>

                  <ImageUploader
                    modelType="chest_xray"
                    onImageSelected={handleImageSelected}
                    disabled={loading}
                  />

                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Detects</h3>
                    <ul className="text-sm space-y-1">
                      <li>• COVID-19</li>
                      <li>• Pneumonia</li>
                      <li>• Tuberculosis</li>
                      <li>• Normal</li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-1" />
                    <p className="text-xs text-amber-700">
                      AI is assistive only. Consult a doctor for final diagnosis.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="lg:col-span-2 space-y-6">

                {/* LOADING */}
                {loading && (
                  <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow">
                    <div className="text-center space-y-3">
                      <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                      <p className="font-medium">Analyzing X-ray...</p>
                      <p className="text-sm text-gray-500">
                        Running deep learning model
                      </p>
                    </div>
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-700 mb-2">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* RESULT */}
                {result && (
                  <>
                    {/* MAIN RESULT */}
                    <ResultCard
                      title="Chest X-ray Analysis"
                      primaryFinding={result.primary_finding}
                      confidence={result.confidence}
                      processingTime={result.processing_time_ms}
                      findings={result.secondary_findings}
                      recommendations={
                        result.clinical_notes
                          ? [result.clinical_notes]
                          : []
                      }
                      diseases={result.diseases}
                    />

                    {/* CLEAN VISUALS */}
                    <div className="grid md:grid-cols-2 gap-6">

                      {/* Donut */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm">
                        <h3 className="text-md font-semibold mb-3">
                          Disease Distribution
                        </h3>
                        <DonutChart data={result.diseases} />
                      </div>

                      {/* Radar */}
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm">
                        <h3 className="text-md font-semibold mb-3">
                          Pattern Correlation
                        </h3>
                        <DiseaseRadar data={result.diseases} />
                      </div>

                    </div>
                  </>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && !result && (
                  <div className="bg-white rounded-xl p-12 border-2 border-dashed text-center">
                    <p className="text-gray-500">
                      Upload an X-ray to begin AI analysis
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

