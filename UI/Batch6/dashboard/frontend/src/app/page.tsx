
'use client'

import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MetricsOverview } from '@/components/dashboard/MetricsOverview'
import { RealtimeCharts } from '@/components/dashboard/RealtimeCharts'
import { ProjectTimeline } from '@/components/dashboard/ProjectTimeline'
import { TeamPerformance } from '@/components/dashboard/TeamPerformance'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rich Output Generation & Visualization
            </h1>
            <p className="text-gray-600 mt-1">
              Advanced dashboard for SDLC metrics, reports, and visualizations
            </p>
          </div>
          <QuickActions />
        </div>

        {/* Metrics Overview */}
        <MetricsOverview />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Real-time Charts */}
          <div className="lg:col-span-1">
            <RealtimeCharts />
          </div>

          {/* Team Performance */}
          <div className="lg:col-span-1">
            <TeamPerformance />
          </div>
        </div>

        {/* Project Timeline */}
        <div className="w-full">
          <ProjectTimeline />
        </div>
      </div>
    </DashboardLayout>
  )
}
