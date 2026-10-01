'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import ImageUploader from '@/components/imaging/image-uploader'
import { apiClient } from '@/lib/api-client'
import { Loader, AlertCircle } from 'lucide-react'

export default function DentalPage() {
  const [outputImage, setOutputImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelected = async (file: File, preview: string) => {
    setLoading(true)
    setError(null)
    setOutputImage(null)

    try {
      console.log('[v0] Starting dental prediction with file:', file.name)
      const blob = await apiClient.predictDentalImage(file)
      const url = URL.createObjectURL(blob)
      setOutputImage(url)
      console.log('[v0] Dental prediction completed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image'
      console.error('[v0] Dental prediction error:', errorMessage)
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
          title="Dental Anomaly Detection"
          subtitle="Analyze dental X-rays for anomalies"
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
                    modelType="dental"
                    onImageSelected={handleImageSelected}
                    disabled={loading}
                  />

                  {/* Info Section */}
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Detection Capabilities
                    </h3>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <li>• Caries (cavities)</li>
                      <li>• Periapical lesions</li>
                      <li>• Impacted teeth</li>
                      <li>• Bone loss</li>
                      <li>• Root anomalies</li>
                    </ul>
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
                        Analyzing dental X-ray...
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        This usually takes 2-5 seconds
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
                      Please check that the dental backend server is running on port 5000
                    </p>
                  </div>
                )}

                {outputImage && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      Analysis Result
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={outputImage}
                        alt="Processed Dental Image"
                        className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        AI is assistive only. Consult a dentist for final diagnosis.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && !error && !outputImage && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      Upload a dental X-ray image to begin analysis
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
