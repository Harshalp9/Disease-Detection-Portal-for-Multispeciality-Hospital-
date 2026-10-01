


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface ChestXrayResult {
  model_name: string
  confidence: number
  class_name: string
  processing_time_ms: number
  timestamp: string

  // 🔥 MAIN OUTPUT
  diseases: {
    COVID19: number
    NORMAL: number
    PNEUMONIA: number
    TUBERCULOSIS: number
  }

  primary_finding: string
  secondary_findings: string[]
  clinical_notes: string
}

export interface DentalResult {
  model_name: string
  confidence: number
  class_name: string
  processing_time_ms: number
  timestamp: string
  anomaly_type: string
  location: string
  severity: "Low" | "Medium" | "High"
  recommendations: string[]
}

export interface FractureResult {
  model_name: string
  confidence: number
  class_name: string
  processing_time_ms: number
  timestamp: string
  fracture_type: string
  location: string
  severity: "Hairline" | "Stable" | "Displaced"
  affected_bone: string
}

export interface FractureAnnotatedResponse {
  result: FractureResult
  annotated_image_base64: string
}

class MedicalImagingAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // ---------------- CHEST X-RAY ----------------
  async inferChestXray(file: File): Promise<ChestXrayResult> {
    return this.upload("/api/inference/chest-xray", file)
  }

  // ---------------- DENTAL ----------------
  async inferDental(file: File): Promise<DentalResult> {
    return this.upload("/api/inference/dental", file)
  }

  // Dental image prediction (returns processed image)
  async predictDentalImage(file: File): Promise<Blob> {
    const formData = new FormData()
    formData.append("image", file)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!res.ok) {
        throw new Error(`Prediction failed: ${res.status} ${res.statusText}`)
      }

      return res.blob()
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Request timeout (server took too long)")
      }
      throw err
    }
  }

  // ---------------- FRACTURE ----------------
  async inferFracture(file: File): Promise<FractureResult> {
    return this.upload("/api/inference/fracture", file)
  }

  async inferFractureAnnotated(file: File): Promise<FractureAnnotatedResponse> {
    return this.upload("/api/inference/fracture/annotated", file)
  }

  // ---------------- CORE UPLOAD FUNCTION ----------------
  private async upload(endpoint: string, file: File) {
    const formData = new FormData()
    formData.append("file", file)

    // ⏱ timeout handling
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!res.ok) {
        let errMsg = "Unknown error"
        try {
          const err = await res.json()
          errMsg = err.detail || err.message || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      return res.json()
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new Error("Request timeout (server took too long)")
      }
      throw err
    }
  }

  // ---------------- HEALTH ----------------
  async getHealth() {
    const res = await fetch(`${this.baseUrl}/api/inference/health`)
    if (!res.ok) throw new Error("Health check failed")
    return res.json()
  }

  
  async listModels() {
    const res = await fetch(`${this.baseUrl}/api/inference/models`)
    if (!res.ok) throw new Error("Failed to list models")
    return res.json()
  }
}

// Singleton
export const apiClient = new MedicalImagingAPI()
