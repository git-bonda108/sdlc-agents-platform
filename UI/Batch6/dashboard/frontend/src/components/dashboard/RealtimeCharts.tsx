
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  labels: string[]
  datasets: any[]
}

export function RealtimeCharts() {
  const [performanceData, setPerformanceData] = useState<ChartData>({
    labels: [],
    datasets: []
  })
  const [velocityData, setVelocityData] = useState<ChartData>({
    labels: [],
    datasets: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateMockData = () => {
      const now = new Date()
      const labels = []
      const performanceValues = []
      const velocityValues = []

      // Generate last 24 hours of data
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        labels.push(time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }))
        
        // Mock performance data (response time)
        performanceValues.push(Math.random() * 200 + 100)
        
        // Mock velocity data
        velocityValues.push(Math.random() * 50 + 30)
      }

      setPerformanceData({
        labels,
        datasets: [
          {
            label: 'Response Time (ms)',
            data: performanceValues,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      })

      setVelocityData({
        labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'],
        datasets: [
          {
            label: 'Story Points Completed',
            data: [32, 45, 38, 52, 41, 48],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          },
          {
            label: 'Story Points Planned',
            data: [40, 50, 45, 55, 45, 50],
            backgroundColor: 'rgba(156, 163, 175, 0.8)',
            borderColor: 'rgb(156, 163, 175)',
            borderWidth: 1
          }
        ]
      })

      setLoading(false)
    }

    generateMockData()

    // Update data every 30 seconds
    const interval = setInterval(generateMockData, 30000)

    return () => clearInterval(interval)
  }, [])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Performance
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={performanceData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Velocity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sprint Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={velocityData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
