// src/pages/Analytics.jsx
import React from 'react'
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard'

const Analytics = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Analytics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover insights and patterns in your data with interactive visualizations and AI-powered analysis
          </p>
        </div>
        <AnalyticsDashboard />
      </div>
    </div>
  )
}

export default Analytics