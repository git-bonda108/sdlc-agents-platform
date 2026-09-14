
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, Users, Clock, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Metric {
  id: string
  name: string
  value: number
  unit: string
  target?: number
  trend: number
  status: 'good' | 'warning' | 'critical'
}

export function MetricsOverview() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchMetrics = async () => {
      try {
        // Mock data - in real app, fetch from API
        const mockMetrics: Metric[] = [
          {
            id: 'velocity',
            name: 'Development Velocity',
            value: 42.5,
            unit: 'story points/sprint',
            target: 45,
            trend: 0.08,
            status: 'good'
          },
          {
            id: 'quality',
            name: 'Code Quality Score',
            value: 8.7,
            unit: 'score',
            target: 9.0,
            trend: 0.05,
            status: 'good'
          },
          {
            id: 'deployment',
            name: 'Deployment Frequency',
            value: 3.2,
            unit: 'deployments/week',
            target: 4.0,
            trend: -0.02,
            status: 'warning'
          },
          {
            id: 'satisfaction',
            name: 'Customer Satisfaction',
            value: 4.3,
            unit: 'rating',
            target: 4.5,
            trend: 0.12,
            status: 'good'
          },
          {
            id: 'lead-time',
            name: 'Lead Time',
            value: 72,
            unit: 'hours',
            target: 48,
            trend: -0.15,
            status: 'critical'
          },
          {
            id: 'team-efficiency',
            name: 'Team Efficiency',
            value: 87,
            unit: '%',
            target: 90,
            trend: 0.03,
            status: 'good'
          }
        ]

        setMetrics(mockMetrics)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIcon = (id: string) => {
    switch (id) {
      case 'velocity':
        return Activity
      case 'quality':
        return Target
      case 'deployment':
        return TrendingUp
      case 'satisfaction':
        return Users
      case 'lead-time':
        return Clock
      case 'team-efficiency':
        return Users
      default:
        return Activity
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const Icon = getIcon(metric.id)
        const isPositiveTrend = metric.trend > 0
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown

        return (
          <Card key={metric.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.name}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  {metric.target && (
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {metric.target} {metric.unit}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                  <div className={cn(
                    "flex items-center text-xs",
                    isPositiveTrend ? "text-green-600" : "text-red-600"
                  )}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {Math.abs(metric.trend * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
