'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import ImageUploader from '@/components/imaging/image-uploader'
import ResultCard from '@/components/imaging/result-card'
import { apiClient, FractureAnnotatedResponse, FractureResult } from '@/lib/api-client'
import { Loader } from 'lucide-react'

export default function FracturePage() {
  const [result, setResult] = useState<FractureResult | null>(null)
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelected = async (file: File, preview: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setAnnotatedImage(null)

    try {
      console.log('[v0] Starting fracture inference with file:', file.name)
      const response: FractureAnnotatedResponse = await apiClient.inferFractureAnnotated(file)
      console.log('[v0] Fracture inference completed:', response)
      setResult(response.result)
      setAnnotatedImage(`data:image/png;base64,${response.annotated_image_base64}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
      console.error('[v0] Fracture inference error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-hospital-background">
      <DashboardSidebar />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Fracture Detection"
          subtitle="Analyze bone X-rays for fractures"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 sticky top-8">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Upload X-ray
                  </h2>
                  <ImageUploader
                    modelType="fracture"
                    onImageSelected={handleImageSelected}
                    disabled={loading}
                  />

                  {/* Info Section */}
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Detection Capabilities
                    </h3>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• Hairline fractures</li>
                      <li>• Stable fractures</li>
                      <li>• Displaced fractures</li>
                      <li>• Stress fractures</li>
                      <li>• Multi-site fractures</li>
                      <li>• Comminuted fractures</li>
                    </ul>
                  </div>

                  {/* Supported Bones */}
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                      Supported Bones
                    </h3>
                    <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-300">
                      <span>• Femur</span>
                      <span>• Tibia</span>
                      <span>• Humerus</span>
                      <span>• Radius</span>
                      <span>• Ulna</span>
                      <span>• Fibula</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-2">
                {loading && (
                  <div className="flex items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Analyzing bone X-ray...
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        Detecting fractures with high precision
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                      Analysis Error
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                      {error}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Please check that the backend server is running on port 8000
                    </p>
                  </div>
                )}

                {result && (
                  <div className="space-y-6">
                    {annotatedImage && (
                      <div className="rounded-2xl border bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="text-lg font-semibold">Annotated Output</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            The uploaded X-ray with fracture detection overlay.
                          </p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4">
                          <img
                            src={annotatedImage}
                            alt="Annotated fracture result"
                            className="w-full rounded-xl object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <ResultCard
                      title="Fracture Analysis"
                      primaryFinding={result.fracture_type}
                      confidence={result.confidence}
                      processingTime={result.processing_time_ms}
                      severity={result.severity}
                      findings={[
                        `Affected bone: ${result.affected_bone}`,
                        `Location: ${result.location}`
                      ]}
                      recommendations={[
                        'Orthopedic consultation recommended',
                        'Follow-up imaging may be required',
                        'Consider immobilization based on severity'
                      ]}
                    />
                  </div>
                )}

                {!loading && !error && !result && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      Upload a bone X-ray image to begin fracture analysis
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
