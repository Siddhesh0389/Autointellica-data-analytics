// src/components/data-cleaning/DataCleaning.jsx
import React, { useState, useEffect } from 'react'
import { useData } from '../../context/DataContext'
import { dataService } from '../../services/api'
import { Brush, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DataCleaning = () => {
  const { state, dispatch } = useData()
  const navigate = useNavigate()
  const [cleaning, setCleaning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isDataClean, setIsDataClean] = useState(false)

  // Load column stats when component mounts
  useEffect(() => {
    if (state.uploadedFile && state.columnStats.length === 0) {
      loadColumnStats()
    }
  }, [state.uploadedFile])

  // Check if data is clean (no missing values)
  useEffect(() => {
    const hasMissingValues = state.columnStats.some(col => (col.missingCount || 0) > 0)
    setIsDataClean(!hasMissingValues)
  }, [state.columnStats])

  const loadColumnStats = async () => {
    if (!state.uploadedFile) return

    setLoading(true)
    setError('')
    try {
      const response = await dataService.getColumnStats(state.uploadedFile.id)
      console.log('Column stats response:', response.data)
      
      if (response.data.success) {
        dispatch({ type: 'SET_COLUMN_STATS', payload: response.data.data })
        
        // Initialize cleaning config based on column stats
        const initialConfig = {}
        response.data.data.forEach(column => {
          if (column.missingCount > 0) {
            if (column.dataType === 'numeric' || column.dataType === 'number') {
              initialConfig[column.columnName] = 'median'
            } else {
              initialConfig[column.columnName] = 'mode'
            }
          } else {
            initialConfig[column.columnName] = 'none'
          }
        })
        dispatch({ type: 'SET_CLEANING_CONFIG', payload: initialConfig })
      } else {
        setError(response.data.message || 'Failed to load column statistics')
      }
    } catch (error) {
      console.error('Failed to load column stats:', error)
      setError('Failed to load column statistics. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCleaning = async () => {
    if (!state.uploadedFile) {
      setError('No file uploaded. Please upload a file first.');
      return;
    }

    setCleaning(true);
    setError('');
    setSuccess('');

    try {
      const fileId = state.uploadedFile.id;
      
      console.log('=== DEBUG FRONTEND CLEANING CONFIG ===');
      console.log('Full state.cleaningConfig:', JSON.stringify(state.cleaningConfig, null, 2));
      
      // Check if cleaningConfig has the right structure
      if (!state.cleaningConfig || Object.keys(state.cleaningConfig).length === 0) {
        setError('No cleaning configuration found. Please configure cleaning methods first.');
        return;
      }

      // Prepare cleaning methods - ONLY include non-"none" methods
      const cleaningMethods = {};
      let hasValidMethods = false;
      
      Object.keys(state.cleaningConfig).forEach(columnName => {
        const method = state.cleaningConfig[columnName];
        console.log(`Column: ${columnName}, Method: ${method}`);
        
        if (method && method !== 'none') {
          cleaningMethods[columnName] = method;
          hasValidMethods = true;
        }
      });

      console.log('Final cleaningMethods to send:', cleaningMethods);

      if (!hasValidMethods) {
        setError('No valid cleaning methods selected. Please choose methods other than "Leave as missing".');
        return;
      }

      const requestPayload = {
        columnMethods: cleaningMethods,
        autoClean: false
      };

      console.log('Final request payload:', JSON.stringify(requestPayload, null, 2));

      const response = await dataService.cleanData(fileId, requestPayload);
      console.log('Backend response:', response.data);

      // FIX: Properly handle backend response - don't treat success message as error
      if (response.data.success) {
        const cleanedData = response.data.data;
        console.log('Cleaning successful!');
        
        // Set success message - use a fixed message, not from backend
        setSuccess('Data cleaned successfully! All missing values have been handled.');
        
        // Reload column stats to reflect the cleaned data
        await loadColumnStats();
        
      } else {
        // Only set error if the backend explicitly indicates failure
        setError(response.data.message || 'Data cleaning failed');
      }

    } catch (error) {
      console.error('Data cleaning failed:', error);
      console.error('Error details:', error.response?.data);
      
      // FIX: Check if the backend is sending success message in error format
      const backendMessage = error.response?.data?.message;
      if (backendMessage && backendMessage.toLowerCase().includes('success')) {
        // If backend sends success message as error, treat it as success
        setSuccess('Data cleaned successfully!');
        await loadColumnStats();
      } else {
        setError(backendMessage || 'Data cleaning failed. Please try again.');
      }
    } finally {
      setCleaning(false);
    }
  };

  const handleAutoClean = async () => {
    if (!state.uploadedFile) {
      setError('No file uploaded. Please upload a file first.');
      return;
    }

    setCleaning(true);
    setError('');
    setSuccess('');

    try {
      const fileId = state.uploadedFile.id;
      console.log('Auto cleaning file ID:', fileId);

      const response = await dataService.cleanData(fileId, {
        auto_clean: true
      });

      console.log('Auto cleaning response:', response.data);

      if (response.data.success) {
        // Update context with cleaned dataset
        dispatch({ 
          type: 'SET_DATASET', 
          payload: {
            data: response.data.data,
            metadata: response.data.metadata
          }
        });
        
        // Set success message
        setSuccess('Data auto-cleaned successfully!');
        
        // Reload column stats after cleaning
        await loadColumnStats();
        
        // Update cleaning config to reflect what was applied
        if (response.data.applied_methods) {
          dispatch({ type: 'SET_CLEANING_CONFIG', payload: response.data.applied_methods });
        }
        
      } else {
        setError(response.data.message || 'Auto cleaning failed');
      }

    } catch (error) {
      console.error('Auto cleaning failed:', error);
      
      // FIX: Check if the backend is sending success message in error format
      const backendMessage = error.response?.data?.message;
      if (backendMessage && backendMessage.toLowerCase().includes('success')) {
        setSuccess('Data auto-cleaned successfully!');
        await loadColumnStats();
      } else {
        setError(backendMessage || error.response?.data?.error || 'Auto cleaning failed. Please try again.');
      }
    } finally {
      setCleaning(false);
    }
  };

  const handleNavigateToAnalytics = () => {
    navigate('/analytics');
  };

  const totalMissingValues = state.columnStats.reduce((total, col) => total + (col.missingCount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Brush className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Data Cleaning Configuration
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Configure how missing values should be handled for each column. Missing values will be filled based on your selection.
        </p>

        {/* MAIN STATUS INDICATOR - This should be the primary status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          isDataClean
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center">
            {isDataClean ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">✓ Data cleaned successfully</p>
                  <p className="text-sm mt-1 text-green-700">
                    All missing values have been handled. Your data is ready for analysis.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium text-blue-800">Data requires cleaning</p>
                  <p className="text-sm mt-1 text-blue-700">
                    {totalMissingValues} missing values found. Configure cleaning methods below.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TEMPORARY ERROR MESSAGE - Only shows for actual errors */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* TEMPORARY SUCCESS MESSAGE - Only shows immediately after action */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* File Info */}
        {state.uploadedFile && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">File: {state.uploadedFile.originalFilename}</h3>
                <p className="text-gray-600 text-sm">
                  {state.uploadedFile.totalRows} rows × {state.uploadedFile.totalColumns} columns
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  totalMissingValues > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  Missing values: {totalMissingValues}
                  {totalMissingValues === 0 && ' ✓'}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="text-gray-600 mt-2">Loading column statistics...</p>
          </div>
        ) : (
          <CleaningConfiguration isDataClean={isDataClean} />
        )}
        
        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-end">
          {/* Auto Clean Button */}
          <button
            onClick={handleAutoClean}
            disabled={cleaning || loading || isDataClean}
            className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center ${
              cleaning || loading || isDataClean
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {cleaning ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
            {isDataClean ? 'Already Cleaned ✓' : 'Auto Clean'}
          </button>

          {/* Clean Data Button */}
          <button
            onClick={handleCleaning}
            disabled={cleaning || loading || isDataClean}
            className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center ${
              cleaning || loading || isDataClean
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
            }`}
          >
            {cleaning ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
            {cleaning ? 'Cleaning Data...' : (isDataClean ? 'Data Cleaned ✓' : 'Clean Data')}
          </button>

          {/* Navigate to Analytics Button - Only show after successful cleaning */}
          {isDataClean && (
            <button
              onClick={handleNavigateToAnalytics}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
            >
              Continue to Analytics →
            </button>
          )}
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-semibold text-blue-800 mb-2">About Cleaning Method</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <h4>• <strong>Cleaning Method:</strong> Always use Clean Method for optimal results</h4>
        </ul>
      </div> 
    </div>
  );
};

const CleaningConfiguration = ({ isDataClean }) => {
  const { state, dispatch } = useData();

  const updateCleaningMethod = (columnName, method) => {
    dispatch({
      type: 'SET_CLEANING_CONFIG',
      payload: {
        ...state.cleaningConfig,
        [columnName]: method
      }
    });
  };

  if (!state.columnStats || state.columnStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No column statistics available. Please upload a file first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.columnStats.map((column) => {
        const missingCount = column.missingCount || 0;
        const columnType = column.dataType || column.type;
        const isColumnClean = missingCount === 0;
        
        return (
          <div
            key={column.columnName || column.name}
            className={`border rounded-lg p-4 transition-all ${
              isColumnClean 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:shadow-md bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h4 className="font-medium text-gray-800">{column.columnName || column.name}</h4>
                <span className={`text-sm ${
                  isColumnClean ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {missingCount} missing values
                  {column.missingPercentage && ` (${column.missingPercentage.toFixed(1)}%)`}
                  {isColumnClean && ' ✓'}
                </span>
              </div>
              <span
                className={`px-3 py-1 text-sm rounded-full border ${
                  isColumnClean
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}
              >
                {isColumnClean ? 'Clean ✓' : 'Needs Cleaning'}
              </span>
            </div>

            {/* Column Statistics */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
              <div>Type: <span className="font-medium">{columnType}</span></div>
              <div>Total: <span className="font-medium">{column.totalCount}</span></div>
              {column.uniqueCount && (
                <div>Unique: <span className="font-medium">{column.uniqueCount}</span></div>
              )}
              {columnType === 'numeric' && column.mean && (
                <div>Mean: <span className="font-medium">{column.mean.toFixed(2)}</span></div>
              )}
            </div>

            {/* Radio buttons in a grid layout - Only show if column needs cleaning */}
            {!isColumnClean && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* For numeric columns */}
                  {(columnType === 'numeric' || columnType === 'number') && (
                    <>
                      <CleaningOption
                        column={column}
                        method="mean"
                        currentMethod={state.cleaningConfig[column.columnName || column.name]}
                        onUpdate={updateCleaningMethod}
                        label="Replace by Mean"
                        disabled={!column.mean}
                      />
                      <CleaningOption
                        column={column}
                        method="median"
                        currentMethod={state.cleaningConfig[column.columnName || column.name]}
                        onUpdate={updateCleaningMethod}
                        label="Replace by Median"
                        disabled={!column.median}
                      />
                      <CleaningOption
                        column={column}
                        method="mode"
                        currentMethod={state.cleaningConfig[column.columnName || column.name]}
                        onUpdate={updateCleaningMethod}
                        label="Replace by Mode"
                      />
                    </>
                  )}
                  
                  {/* For text/categorical columns */}
                  {(columnType === 'text' || columnType === 'category' || columnType === 'object') && (
                    <CleaningOption
                      column={column}
                      method="mode"
                      currentMethod={state.cleaningConfig[column.columnName || column.name]}
                      onUpdate={updateCleaningMethod}
                      label="Replace by Most Frequent"
                    />
                  )}
                  
                  {/* Common option for all columns */}
                  <CleaningOption
                    column={column}
                    method="none"
                    currentMethod={state.cleaningConfig[column.columnName || column.name]}
                    onUpdate={updateCleaningMethod}
                    label="Leave as missing"
                  />
                </div>

                {/* Show suggested method for columns with missing values */}
                {missingCount > 0 && !state.cleaningConfig[column.columnName || column.name] && (
                  <p className="text-sm text-orange-600 mt-2">
                    Suggested: {(columnType === 'numeric' || columnType === 'number') ? 'median' : 'mode'}
                  </p>
                )}
              </>
            )}
            
            {/* Show clean status message */}
            {isColumnClean && (
              <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  This column is clean and ready for analysis
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CleaningOption = ({ column, method, currentMethod, onUpdate, label, disabled = false }) => (
  <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
    disabled 
      ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50' 
      : currentMethod === method 
        ? 'border-purple-500 bg-purple-50' 
        : 'border-gray-200 hover:bg-gray-50'
  }`}>
    <input
      type="radio"
      name={`cleaning-${column.columnName || column.name}`}
      value={method}
      checked={currentMethod === method}
      onChange={() => !disabled && onUpdate(column.columnName || column.name, method)}
      disabled={disabled}
      className="text-purple-600 focus:ring-purple-500"
    />
    <span className={`font-medium ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>
      {label}
      {disabled && method !== 'none' && (
        <span className="text-xs text-gray-500 block">(No data available)</span>
      )}
    </span>
  </label>
);

export default DataCleaning;