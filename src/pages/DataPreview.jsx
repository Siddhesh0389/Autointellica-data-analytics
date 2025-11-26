// src/pages/DataPreview.jsx
import React from 'react'
import DataPreviewComponent from '../components/data-preview/DataPreview'

const DataPreview = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Preview</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Review your uploaded data and check for missing values and data quality issues
          </p>
        </div>
        <DataPreviewComponent />
      </div>
    </div>
  )
}

export default DataPreview