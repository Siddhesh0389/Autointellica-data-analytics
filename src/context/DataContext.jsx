// src/context/DataContext.jsx
import React, { createContext, useContext, useReducer } from 'react'

const DataContext = createContext()

const initialState = {
  currentStep: 1,
  uploadedFile: null,
  dataset: null,
  previewData: null,
  columnStats: [],
  cleaningConfig: {},
  analysisResults: null,
  charts: [],
  reportData: null
}

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'SET_UPLOADED_FILE':
      return { 
        ...state, 
        uploadedFile: action.payload,
        currentStep: 2 // Automatically move to preview step
      }
    case 'SET_PREVIEW_DATA':
      return { ...state, previewData: action.payload }
    case 'SET_DATASET':
      return { ...state, dataset: action.payload }
    case 'SET_COLUMN_STATS':
      return { ...state, columnStats: action.payload }
    case 'SET_CLEANING_CONFIG':
      return { ...state, cleaningConfig: action.payload }
    case 'SET_ANALYSIS_RESULTS':
      return { ...state, analysisResults: action.payload }
    case 'SET_CHARTS':
      return { ...state, charts: action.payload }
    case 'SET_REPORT_DATA':
      return { ...state, reportData: action.payload }
    case 'RESET_UPLOAD':
      return {
        ...state,
        uploadedFile: null,
        previewData: null,
        columnStats: [],
        currentStep: 1
      }
    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}