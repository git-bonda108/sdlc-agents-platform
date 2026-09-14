
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, FileText, BarChart3, Download, Presentation, Zap } from 'lucide-react'

export function QuickActions() {
  const handleCreateReport = () => {
    // Navigate to report creation
    console.log('Creating new report...')
  }

  const handleCreateVisualization = () => {
    // Navigate to visualization creation
    console.log('Creating new visualization...')
  }

  const handleExportDashboard = () => {
    // Export current dashboard
    console.log('Exporting dashboard...')
  }

  const handleCreatePresentation = () => {
    // Navigate to presentation creation
    console.log('Creating new presentation...')
  }

  const handleGenerateInsights = () => {
    // Generate AI insights
    console.log('Generating AI insights...')
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleGenerateInsights} variant="outline" size="sm">
        <Zap className="h-4 w-4 mr-2" />
        AI Insights
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCreateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCreateVisualization}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Create Visualization
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCreatePresentation}>
            <Presentation className="h-4 w-4 mr-2" />
            Build Presentation
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleExportDashboard}>
            <Download className="h-4 w-4 mr-2" />
            Export Dashboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
