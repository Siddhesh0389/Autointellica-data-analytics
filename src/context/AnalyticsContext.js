// src/context/AnalyticsContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AnalyticsContext = createContext();

const initialState = {
  analysisResult: null,
  loading: false,
  error: null,
  quickStats: null,
  currentView: 'overview' // overview, insights, correlations, summary
};

const analyticsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? state.error : null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'SET_ANALYSIS_RESULT':
      return {
        ...state,
        loading: false,
        error: null,
        analysisResult: action.payload
      };
    
    case 'SET_QUICK_STATS':
      return {
        ...state,
        quickStats: action.payload
      };
    
    case 'SET_CURRENT_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'RESET_ANALYTICS':
      return initialState;
    
    default:
      return state;
  }
};

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  return (
    <AnalyticsContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};