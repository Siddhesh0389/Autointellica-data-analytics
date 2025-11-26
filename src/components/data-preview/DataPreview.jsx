// src/components/data-preview/DataPreview.jsx
import React, { useEffect, useState } from 'react'
import { useData } from '../../context/DataContext'
import { dataService } from '../../services/api'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

const DataPreview = () => {
  const { state, dispatch } = useData()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (state.uploadedFile) {
        try {
          setLoading(true)
          setError('')
          
          const fileId = state.uploadedFile.id
          console.log('Fetching preview for file ID:', fileId)
          
          const [previewResponse, statsResponse] = await Promise.all([
            dataService.getPreview(fileId),
            dataService.getColumnStats(fileId)
          ])
          
          console.log('Preview response:', previewResponse.data)
          console.log('Stats response:', statsResponse.data)
          
          dispatch({ type: 'SET_PREVIEW_DATA', payload: previewResponse.data.data })
          dispatch({ type: 'SET_COLUMN_STATS', payload: statsResponse.data.data })
          
        } catch (error) {
          console.error('Error fetching preview data:', error)
          setError(error.response?.data?.message || 'Failed to load preview data')
        } finally {
          setLoading(false)
        }
      } else {
        setError('No file uploaded. Please upload a file first.')
        setLoading(false)
      }
    }

    fetchPreviewData()
  }, [state.uploadedFile, dispatch])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-4 text-gray-600">Loading preview data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Preview</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* File Info Card */}
      {state.uploadedFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              File loaded: {state.uploadedFile.originalFilename}
            </span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            {/* Size: {(state.uploadedFile.fileSize / 1024).toFixed(2)} KB |  */}
            Rows: {state.uploadedFile.totalRows} | 
            Columns: {state.uploadedFile.totalColumns}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Data Preview
        </h2>
        <p className="text-gray-600 mb-6">
          Preview of your uploaded data with missing values highlighted
        </p>
        
        <DataTable />
      </div>
      
      <ColumnStatistics />
    </div>
  )
}

const DataTable = () => {
  const { state } = useData()
  const previewData = state.previewData || { headers: [], rows: [] }

  if (!previewData.headers || previewData.headers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Info className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">No data available for preview</span>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {previewData.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {previewData.rows.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-4 py-3 whitespace-nowrap text-sm ${
                    isMissingValue(cell)
                      ? 'bg-red-100 text-red-800 font-medium'
                      : 'text-gray-900'
                  }`}
                >
                  {isMissingValue(cell) ? 'MISSING' : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {previewData.rows.length > 10 && (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
          Showing first 10 rows of {previewData.totalRows || previewData.rows.length} total rows
        </div>
      )}
    </div>
  )
}

const ColumnStatistics = () => {
  const { state } = useData()

  if (!state.columnStats || state.columnStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Column Statistics
        </h3>
        <div className="text-gray-500 text-center py-8">
          No statistics available
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Column Statistics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.columnStats.map((column, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-linear-to-br from-blue-50 to-indigo-50">
            {/* FIXED: Use columnName instead of name */}
            <h4 className="font-medium text-gray-800 mb-2">{column.columnName}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {/* FIXED: Use dataType instead of type */}
              <div>Type: <span className="font-medium">{column.dataType || 'unknown'}</span></div>
              <div>
                Missing Values: 
                <span className={`font-medium ml-1 ${
                  column.missingCount > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {column.missingCount}
                  {column.missingPercentage > 0 && 
                    ` (${column.missingPercentage.toFixed(1)}%)`
                  }
                </span>
              </div>
              
              {/* Data Quality Indicator */}
              {column.dataQuality && (
                <div>
                  Quality: 
                  <span className={`font-medium ml-1 ${getQualityColor(column.dataQuality)}`}>
                    {column.dataQuality}
                  </span>
                </div>
              )}
              
              {/* Numeric Column Stats */}
              {column.dataType === 'numeric' && (
                <>
                  {column.mean !== undefined && (
                    <div>Mean: <span className="font-medium">{column.mean?.toFixed(2)}</span></div>
                  )}
                  {column.median !== undefined && (
                    <div>Median: <span className="font-medium">{column.median?.toFixed(2)}</span></div>
                  )}
                  {column.stdDev !== undefined && (
                    <div>Std Dev: <span className="font-medium">{column.stdDev?.toFixed(2)}</span></div>
                  )}
                </>
              )}
              
              {/* Text Column Stats */}
              {column.dataType === 'text' && (
                <>
                  <div>Unique Values: <span className="font-medium">{column.uniqueCount}</span></div>
                  {column.mode && (
                    <div>Mode: <span className="font-medium">{column.mode}</span></div>
                  )}
                </>
              )}
              
              {/* Sample Values */}
              {column.sampleValues && column.sampleValues.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Sample Values:</div>
                  <div className="text-xs">
                    {column.sampleValues.slice(0, 3).map((value, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded mr-1 mb-1 inline-block">
                        {String(value).substring(0, 15)}
                        {String(value).length > 15 ? '...' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Missing Value Examples */}
              {column.missingValueExamples && column.missingValueExamples.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Missing Value Types:</div>
                  <div className="text-xs">
                    {column.missingValueExamples.map((value, i) => (
                      <span key={i} className="bg-red-100 text-red-700 px-2 py-1 rounded mr-1 mb-1 inline-block">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper function to check if a value is missing
const isMissingValue = (value) => {
  if (value === null || value === undefined) return true;
  const strValue = String(value).trim();
  return strValue === '' || 
         strValue === '?' || 
         strValue === '-' || 
         strValue.toLowerCase() === 'na' || 
         strValue.toLowerCase() === 'n/a' || 
         strValue.toLowerCase() === 'null' || 
         strValue.toLowerCase() === 'missing';
}

// Helper function for quality indicator colors
const getQualityColor = (quality) => {
  if (quality.includes('Excellent')) return 'text-green-600';
  if (quality.includes('Good')) return 'text-green-500';
  if (quality.includes('Fair')) return 'text-yellow-600';
  if (quality.includes('Poor')) return 'text-orange-600';
  if (quality.includes('Critical')) return 'text-red-600';
  return 'text-gray-600';
}

export default DataPreview