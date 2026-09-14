
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  name: string
  start_date: string
  end_date: string
  progress: number
  assignee: string
  status: 'completed' | 'in_progress' | 'pending'
  dependencies: string[]
}

interface Milestone {
  id: string
  name: string
  date: string
  status: 'completed' | 'pending'
}

interface TimelineData {
  project_id: string
  project_name: string
  start_date: string
  end_date: string
  tasks: Task[]
  milestones: Milestone[]
}

export function ProjectTimeline() {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        // Mock API call
        const mockData: TimelineData = {
          project_id: 'proj-1',
          project_name: 'Rich Output Generation System',
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          tasks: [
            {
              id: 'task-1',
              name: 'Dashboard Framework Setup',
              start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 100,
              assignee: 'Alice Johnson',
              status: 'completed',
              dependencies: []
            },
            {
              id: 'task-2',
              name: 'Real-time Metrics Implementation',
              start_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 100,
              assignee: 'Bob Smith',
              status: 'completed',
              dependencies: ['task-1']
            },
            {
              id: 'task-3',
              name: 'Visualization Components',
              start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 85,
              assignee: 'Carol Davis',
              status: 'in_progress',
              dependencies: ['task-2']
            },
            {
              id: 'task-4',
              name: 'Report Generation Engine',
              start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 60,
              assignee: 'David Wilson',
              status: 'in_progress',
              dependencies: ['task-2']
            },
            {
              id: 'task-5',
              name: 'Export Functionality',
              start_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 30,
              assignee: 'Eva Brown',
              status: 'in_progress',
              dependencies: ['task-3', 'task-4']
            },
            {
              id: 'task-6',
              name: 'AI Integration',
              start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 0,
              assignee: 'Frank Miller',
              status: 'pending',
              dependencies: ['task-4']
            }
          ],
          milestones: [
            {
              id: 'milestone-1',
              name: 'Core Dashboard Complete',
              date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'completed'
            },
            {
              id: 'milestone-2',
              name: 'Beta Release',
              date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending'
            }
          ]
        }

        setTimelineData(mockData)
      } catch (error) {
        console.error('Error fetching timeline data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTimelineData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!timelineData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No timeline data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Project Timeline - {timelineData.project_name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Milestones */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timelineData.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  {getStatusIcon(milestone.status)}
                  <div className="flex-1">
                    <p className="font-medium">{milestone.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tasks</h3>
            <div className="space-y-3">
              {timelineData.tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <h4 className="font-medium">{task.name}</h4>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDate(task.start_date)} - {formatDate(task.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Progress: {task.progress}%
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        task.status === 'completed'
                          ? 'bg-green-600'
                          : task.status === 'in_progress'
                          ? 'bg-blue-600'
                          : 'bg-gray-400'
                      )}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>

                  {/* Dependencies */}
                  {task.dependencies.length > 0 && (
                    <div className="mt-3 text-sm text-gray-500">
                      Dependencies: {task.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
