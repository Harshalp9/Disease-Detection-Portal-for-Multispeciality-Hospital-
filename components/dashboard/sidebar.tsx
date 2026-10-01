'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard,
  Stethoscope,
  Activity,      // replace Activity
  Smile,          // replace Smile
  Bone,
  Zap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
}

export default function DashboardSidebar({ collapsed = false }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview'
    },
    {
      name: 'Dental Scan',
      href: '/dashboard/dental',
      icon: Smile,
      description: 'Dental anomaly detection'
    },
    {
      name: 'Chest X-ray',
      href: '/dashboard/chest-xray',
      icon: Activity,
      description: 'Disease detection'
    },
    {
      name: 'Fracture',
      href: '/dashboard/fracture',
      icon: Bone,
      description: 'Fracture analysis'
    },
  ]

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-white dark:bg-slate-950 
      border-r border-slate-200 dark:border-slate-800
      transition-all duration-300 ease-out
      ${isCollapsed ? 'w-20' : 'w-64'}
      flex flex-col z-50
      shadow-lg
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">MedAI</h1>
              <p className="text-xs text-slate-500">Dashboard</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-slate-700 dark:text-slate-300
                hover:bg-blue-50 dark:hover:bg-slate-800
                transition-all duration-200
                group relative
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">{item.description}</span>
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-slate-700 dark:text-slate-300
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors
          `}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-slate-500" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/30
            transition-colors
          `}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
