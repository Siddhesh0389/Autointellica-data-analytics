// src/pages/DataUpload.jsx
import React from 'react'
import FileUpload from '../components/data-upload/FileUpload'

const DataUpload = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Data</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your CSV, Excel files or connect directly to a database to start your analysis
          </p>
        </div>
        <FileUpload />
      </div>
    </div>
  )
}

export default DataUpload