// src/pages/DataCleaning.jsx
import React from 'react'
import DataCleaningComponent from '../components/data-cleaning/DataCleaning'

const DataCleaning = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Cleaning</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Configure how to handle missing values and clean your dataset automatically
          </p>
        </div>
        <DataCleaningComponent />
      </div>
    </div>
  )
}

export default DataCleaning