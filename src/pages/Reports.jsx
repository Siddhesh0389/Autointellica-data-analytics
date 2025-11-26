// src/pages/Reports.jsx
import React from 'react'
import ReportGenerator from '../components/reports/ReportGenerator'

const Reports = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Generate Reports</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download comprehensive reports in PDF or Excel format with all your insights and visualizations
          </p>
        </div>
        <ReportGenerator />
      </div>
    </div>
  )
}

export default Reports