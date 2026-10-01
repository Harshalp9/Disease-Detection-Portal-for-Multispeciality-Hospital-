
'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts'

export default function DiseaseRadar({ data }: { data: any }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    subject: name,
    A: Number(value) * 100
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <Radar dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

