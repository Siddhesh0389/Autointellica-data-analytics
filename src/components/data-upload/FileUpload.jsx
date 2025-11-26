// src/components/data-upload/FileUpload.jsx
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Database, FileText, Loader, AlertCircle } from 'lucide-react'
import { dataService } from '../../services/api'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

const FileUpload = () => {
  const { dispatch } = useData()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('file')
  const [uploadError, setUploadError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    setDebugInfo(`Starting upload: ${file.name} (${file.size} bytes, type: ${file.type})`)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setDebugInfo(prev => prev + '\nCreating FormData and sending request...')
      
      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await dataService.uploadFile(formData)
      setDebugInfo(prev => prev + '\n✅ Server response received successfully')
      
      console.log('Full response:', response)
      
      if (!response.data) {
        throw new Error('No data in response')
      }

      const uploadedFile = response.data.data
      setDebugInfo(prev => prev + `\n✅ File uploaded with ID: ${uploadedFile?.id}`)
      
      if (!uploadedFile) {
        throw new Error('No file data in response')
      }

      // Update the context with the uploaded file
      dispatch({ type: 'SET_UPLOADED_FILE', payload: uploadedFile })
      dispatch({ type: 'SET_STEP', payload: 2 })
      
      setDebugInfo(prev => prev + '\n✅ Context updated, navigating to preview...')
      
      // Navigate to preview page
      navigate('/preview')
      
    } catch (error) {
      console.error('Upload failed:', error)
      let errorMessage = 'Upload failed. Please try again.'
      let detailedError = ''
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`
        detailedError = `Status: ${error.response.status}\nMessage: ${errorMessage}`
        
        if (error.response.data?.error) {
          detailedError += `\nError Type: ${error.response.data.error}`
        }
        
        setDebugInfo(prev => prev + `\n❌ Server error: ${detailedError}`)
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.'
        detailedError = 'Network error - no response received'
        setDebugInfo(prev => prev + '\n❌ No response from server (network error)')
      } else {
        // Something else happened
        errorMessage = error.message || 'Unknown error occurred'
        detailedError = error.message
        setDebugInfo(prev => prev + `\n❌ Client error: ${error.message}`)
      }
      
      setUploadError(`${errorMessage}\n\nDebug: ${detailedError}`)
    } finally {
      setUploading(false)
    }
  }, [dispatch, navigate])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12': ['.xlsb'],
      'text/plain': ['.txt'],
      'application/octet-stream': ['.data', '.dat']
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.path} className="text-red-600 text-sm">
      {file.path} - {errors.map(e => e.message).join(', ')}
    </div>
  ))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Upload Your Data
        </h2>
        
        {/* Debug Info */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</h4>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        
        {/* Error Message */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium mb-2">Upload Failed</p>
                <pre className="text-sm text-red-600 whitespace-pre-wrap">{uploadError}</pre>
                <button 
                  onClick={() => {
                    setUploadError('')
                    setDebugInfo('')
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear errors and try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Rejection Errors */}
        {fileRejectionItems.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">File rejected:</p>
                {fileRejectionItems}
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 justify-center">
          <button
            className={`flex items-center px-6 py-3 font-medium text-lg ${
              activeTab === 'file'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('file')}
          >
            <FileText className="w-5 h-5 mr-2" />
            File Upload
          </button>
          <button
            className={`flex items-center px-6 py-3 font-medium text-lg ${
              activeTab === 'database'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('database')}
          >
            <Database className="w-5 h-5 mr-2" />
            Database Connection
          </button>
        </div>

        {/* File Upload Tab */}
        {activeTab === 'file' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} disabled={uploading} />
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-xl text-purple-600">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-xl text-gray-600 mb-3">
                  {uploading ? 'Uploading...' : 'Drag & drop your file here'}
                </p>
                <p className="text-lg text-gray-500 mb-4">
                  or click to select a file
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  Supports: CSV, Excel (.xlsx, .xls, .xlsm, .xlsb), Text files
                </p>
                <p className="text-xs text-gray-400">
                  Maximum file size: 50MB
                </p>
              </div>
            )}
            {uploading && (
              <div className="mt-6">
                <Loader className="animate-spin w-8 h-8 text-purple-600 mx-auto" />
                <p className="text-lg text-gray-600 mt-2">Processing your file...</p>
              </div>
            )}
          </div>
        )}

        {/* Database Connection Tab */}
        {activeTab === 'database' && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">Database Connection</p>
            <p className="text-gray-500">This feature is coming soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload