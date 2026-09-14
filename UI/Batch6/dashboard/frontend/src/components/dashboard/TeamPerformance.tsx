
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, TrendingUp, Award, Target } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface TeamMember {
  id: string
  name: string
  role: string
  productivity_score: number
  tasks_completed: number
  code_quality_score: number
  collaboration_score: number
}

interface TeamMetrics {
  average_productivity: number
  total_tasks_completed: number
  average_code_quality: number
  team_collaboration_index: number
  velocity_trend: number
  burnout_risk: number
}

interface TeamPerformanceData {
  team_members: TeamMember[]
  team_metrics: TeamMetrics
}

export function TeamPerformance() {
  const [performanceData, setPerformanceData] = useState<TeamPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Mock API call
        const mockData: TeamPerformanceData = {
          team_members: [
            {
              id: 'user-1',
              name: 'Alice Johnson',
              role: 'Senior Developer',
              productivity_score: 92.5,
              tasks_completed: 28,
              code_quality_score: 9.2,
              collaboration_score: 8.8
            },
            {
              id: 'user-2',
              name: 'Bob Smith',
              role: 'Frontend Developer',
              productivity_score: 87.3,
              tasks_completed: 24,
              code_quality_score: 8.7,
              collaboration_score: 9.1
            },
            {
              id: 'user-3',
              name: 'Carol Davis',
              role: 'UI/UX Designer',
              productivity_score: 89.1,
              tasks_completed: 22,
              code_quality_score: 8.9,
              collaboration_score: 9.3
            },
            {
              id: 'user-4',
              name: 'David Wilson',
              role: 'Backend Developer',
              productivity_score: 85.7,
              tasks_completed: 26,
              code_quality_score: 8.5,
              collaboration_score: 8.2
            },
            {
              id: 'user-5',
              name: 'Eva Brown',
              role: 'QA Engineer',
              productivity_score: 91.2,
              tasks_completed: 31,
              code_quality_score: 9.0,
              collaboration_score: 8.9
            }
          ],
          team_metrics: {
            average_productivity: 89.2,
            total_tasks_completed: 131,
            average_code_quality: 8.9,
            team_collaboration_index: 8.9,
            velocity_trend: 0.15,
            burnout_risk: 0.2
          }
        }

        setPerformanceData(mockData)
      } catch (error) {
        console.error('Error fetching team performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [])

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Senior Developer': 'bg-purple-100 text-purple-800',
      'Frontend Developer': 'bg-blue-100 text-blue-800',
      'Backend Developer': 'bg-green-100 text-green-800',
      'UI/UX Designer': 'bg-pink-100 text-pink-800',
      'QA Engineer': 'bg-orange-100 text-orange-800',
      'DevOps': 'bg-gray-100 text-gray-800',
      'Manager': 'bg-indigo-100 text-indigo-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!performanceData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No performance data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: ['High Performers', 'Good Performers', 'Average Performers'],
    datasets: [
      {
        data: [
          performanceData.team_members.filter(m => m.productivity_score >= 90).length,
          performanceData.team_members.filter(m => m.productivity_score >= 80 && m.productivity_score < 90).length,
          performanceData.team_members.filter(m => m.productivity_score < 80).length
        ],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
        borderWidth: 0
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performanceData.team_metrics.average_productivity.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Avg Productivity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceData.team_metrics.total_tasks_completed}
              </div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceData.team_metrics.average_code_quality.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Code Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {performanceData.team_metrics.team_collaboration_index.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Collaboration</div>
            </div>
          </div>

          {/* Performance Distribution Chart */}
          <div className="h-48">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Individual Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.team_members.map((member) => (
              <div
                key={member.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{member.name}</h4>
                    <Badge className={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPerformanceBadge(member.productivity_score)}>
                      {member.productivity_score.toFixed(1)}%
                    </Badge>
                    {member.productivity_score >= 90 && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Productivity</span>
                      <span className={getPerformanceColor(member.productivity_score)}>
                        {member.productivity_score.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={member.productivity_score} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Code Quality</span>
                      <span className={getPerformanceColor(member.code_quality_score * 10)}>
                        {member.code_quality_score.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={member.code_quality_score * 10} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Collaboration</span>
                      <span className={getPerformanceColor(member.collaboration_score * 10)}>
                        {member.collaboration_score.toFixed(1)}/10
                      </span>
                    </div>
                    <Progress value={member.collaboration_score * 10} className="h-2" />
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Tasks completed: {member.tasks_completed}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Team Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Velocity Trend</span>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{(performanceData.team_metrics.velocity_trend * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Burnout Risk</span>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">
                    {(performanceData.team_metrics.burnout_risk * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={performanceData.team_metrics.burnout_risk * 100} className="h-2" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider workload redistribution to prevent burnout</li>
              <li>• Organize knowledge sharing sessions to improve code quality</li>
              <li>• Implement pair programming for better collaboration</li>
              <li>• Schedule regular one-on-ones with team members</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
