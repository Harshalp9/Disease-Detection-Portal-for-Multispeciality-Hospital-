'use client'

import { useState, useEffect } from 'react'
import { Activity, Zap, Users, TrendingUp } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/header'
import DashboardSidebar from '@/components/dashboard/sidebar'
import { apiClient } from '@/lib/api-client'

interface StatCard {
  label: string
  value: string | number
  change?: string
  icon: React.ReactNode
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthData = await apiClient.getHealth()
        setHealth(healthData)

        // Initialize stats
        setStats([
          {
            label: 'Scans Processed',
            value: 1247,
            change: '+12% today',
            icon: <Activity className="w-6 h-6" />
          },
          {
            label: 'Avg Processing Time',
            value: '340ms',
            change: 'Within SLA',
            icon: <Zap className="w-6 h-6" />
          },
          {
            label: 'Active Users',
            value: 24,
            change: 'Peak hours',
            icon: <Users className="w-6 h-6" />
          },
          {
            label: 'System Accuracy',
            value: '98.5%',
            change: '+0.2% this month',
            icon: <TrendingUp className="w-6 h-6" />
          }
        ])
      } catch (error) {
        console.error('[v0] Failed to fetch health data:', error)
        setStats([
          {
            label: 'System Status',
            value: 'Initializing',
            icon: <Activity className="w-6 h-6" />
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex h-screen bg-hospital-background">
      <DashboardSidebar />

      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <DashboardHeader
          title="Medical Dashboard"
          subtitle="Monitor AI-powered diagnostic analysis"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <div className="text-blue-600 dark:text-blue-400">
                        {stat.icon}
                      </div>
                    </div>
                    {stat.change && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {stat.change}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Access Cards */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Dental Scan',
                    description: 'Detect anomalies in dental X-rays',
                    href: '/dashboard/dental',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    title: 'Chest X-ray',
                    description: 'Analyze pulmonary conditions',
                    href: '/dashboard/chest-xray',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    title: 'Fracture Detection',
                    description: 'Identify bone fractures',
                    href: '/dashboard/fracture',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((card) => (
                  <a
                    key={card.href}
                    href={card.href}
                    className="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {card.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* System Status */}
            {health && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  System Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                    <p className="text-green-600 dark:text-green-400 font-semibold mt-1">
                      {health.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">GPU Available</p>
                    <p className={`font-semibold mt-1 ${health.gpu_available ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {health.gpu_available ? 'Yes' : 'CPU Mode'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Loaded Models</p>
                    <div className="flex flex-wrap gap-2">
                      {health.loaded_models?.map((model: string) => (
                        <span key={model} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                          {model}
                        </span>
                      )) || <span className="text-slate-500">No models loaded</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
