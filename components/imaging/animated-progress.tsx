'use client'

import { useEffect, useState } from 'react'

interface AnimatedProgressBarProps {
  value: number // 0-100
  duration?: number // ms
}

export function AnimatedProgressBar({
  value,
  duration = 1000
}: AnimatedProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setDisplayValue(Math.floor(value * progress))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  // Determine color based on value
  const getColor = () => {
    if (displayValue >= 80) return 'from-green-500 to-emerald-500'
    if (displayValue >= 60) return 'from-blue-500 to-cyan-500'
    if (displayValue >= 40) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`
          h-full bg-gradient-to-r ${getColor()}
          transition-all duration-300 ease-out rounded-full
          shadow-lg
        `}
        style={{ width: `${displayValue}%` }}
      />
    </div>
  )
}
