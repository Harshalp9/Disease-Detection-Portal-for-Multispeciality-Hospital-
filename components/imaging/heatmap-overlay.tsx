
'use client'

import { useEffect, useState } from 'react'

export default function HeatmapOverlay({ image }: { image: string }) {
  const [points, setPoints] = useState<any[]>([])

  useEffect(() => {
    // 🔥 Generate random hotspots
    const randomPoints = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 80 + 40
    }))

    setPoints(randomPoints)
  }, [image])

  return (
    <div className="relative">
      <img src={image} className="rounded-lg w-full" />

      {points.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-red-500 opacity-30 blur-2xl"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`
          }}
        />
      ))}
    </div>
  )
}
