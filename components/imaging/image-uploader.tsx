'use client'

import { useState, useCallback } from 'react'
import { Upload, X, FileImage, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void
  modelType: 'dental' | 'chest_xray' | 'fracture'
  disabled?: boolean
}

const modelInfo = {
  dental: {
    name: 'Dental Anomaly Detection',
    description: 'Upload intraoral or panoramic X-rays',
    formats: 'JPG, PNG, DICOM'
  },
  chest_xray: {
    name: 'Chest X-ray Analysis',
    description: 'Upload frontal or lateral chest X-rays',
    formats: 'JPG, PNG'
  },
  fracture: {
    name: 'Fracture Detection',
    description: 'Upload bone X-ray images',
    formats: 'JPG, PNG'
  }
}

export default function ImageUploader({
  onImageSelected,
  modelType,
  disabled = false
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const info = modelInfo[modelType]

  const handleFile = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      setError(null)
      onImageSelected(file, result)
    }
    reader.readAsDataURL(file)
  }, [onImageSelected])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <div className="w-full">
      {/* Info Banner */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
          {info.name}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          {info.description}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Supported formats: {info.formats}
        </p>
      </div>

      {preview ? (
        
        // Image Preview
        <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="relative w-full h-96 bg-slate-100 dark:bg-slate-900">
            <Image
              src={preview}
              alt="Uploaded image"
              fill
              className="object-contain p-4"
            />
          </div>

          {/* Clear Button */}
          <button
            onClick={() => {
              setPreview(null)
              setError(null)
            }}
            className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium">Ready for analysis</p>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            transition-all duration-200 cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            id="image-upload"
            disabled={disabled}
          />

          <label
            htmlFor="image-upload"
            className="block cursor-pointer"
          >
            <div className="flex flex-col items-center gap-3">
              {isDragging ? (
                <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
              ) : (
                <FileImage className="w-12 h-12 text-slate-400" />
              )}

              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isDragging ? 'Drop your image here' : 'Drag and drop your image'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 mr-2" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}
