// src/services/api.js
import axios from 'axios'

// Vite uses import.meta.env, not process.env
const API_BASE_URL = import.meta.env.VITE_API_URL

console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown API error';
    
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }
);

// Common headers configuration
const JSON_HEADERS = {
  'Content-Type': 'application/json'
};

const FORM_DATA_HEADERS = {
  'Content-Type': 'multipart/form-data'
};

export const dataService = {
  // Upload file - uses multipart/form-data
  uploadFile: (formData) => {
    return api.post('/upload', formData, {
      headers: FORM_DATA_HEADERS,
      timeout: 60000 // 60 seconds for file uploads
    });
  },
  
  // Get preview data
  getPreview: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getPreview');
    }
    return api.get(`/preview/${fileId}`);
  },
  
  // Clean data - uses JSON with CleaningConfig DTO
  cleanData: (fileId, cleaningConfig) => {
    if (!fileId) {
      throw new Error('File ID is required for cleanData');
    }
    
    console.log('🧹 Sending cleaning request:', {
      fileId,
      cleaningConfig,
      configSize: cleaningConfig?.columnMethods ? Object.keys(cleaningConfig.columnMethods).length : 0
    });
    
    return api.post(`/cleaning/${fileId}/clean`, cleaningConfig, {
      headers: JSON_HEADERS
    });
  },
  
  // Get column statistics
  getColumnStats: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getColumnStats');
    }
    return api.get(`/cleaning/${fileId}/stats`);
  },
  
  // Get missing value analysis
  getMissingValueAnalysis: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getMissingValueAnalysis');
    }
    return api.get(`/cleaning/${fileId}/missing-values`);
  },
  
  // Get data quality report
  getDataQualityReport: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getDataQualityReport');
    }
    return api.get(`/cleaning/${fileId}/data-quality`);
  },
  
  // Get cleaning suggestions
  getCleaningSuggestions: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getCleaningSuggestions');
    }
    return api.post(`/cleaning/${fileId}/suggest-cleaning`, {}, {
      headers: JSON_HEADERS
    });
  },
  
  // Get column types
  getColumnTypes: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getColumnTypes');
    }
    return api.get(`/cleaning/${fileId}/column-types`);
  },
  
  // Get problematic columns
  getProblematicColumns: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getProblematicColumns');
    }
    return api.get(`/cleaning/${fileId}/problematic-columns`);
  },
  
  // Health check
  healthCheck: () => api.get('/cleaning/health'),
  
  // Analyze data
  analyzeData: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for analyzeData');
    }
    return api.get(`/analyze/${fileId}`);
  },
  
  // Generate charts
  generateCharts: (fileId, chartConfig) => {
    if (!fileId) {
      throw new Error('File ID is required for generateCharts');
    }
    return api.post(`/charts/${fileId}`, chartConfig, {
      headers: JSON_HEADERS
    });
  },
  
  // Generate report
  generateReport: (fileId, reportConfig) => {
    if (!fileId) {
      throw new Error('File ID is required for generateReport');
    }
    return api.post(`/report/${fileId}`, reportConfig, { 
      responseType: 'blob',
      headers: JSON_HEADERS
    });
  },
  
  // Database connection
  connectDatabase: (connectionConfig) => {
    if (!connectionConfig) {
      throw new Error('Connection config is required for connectDatabase');
    }
    return api.post('/database/connect', connectionConfig, {
      headers: JSON_HEADERS
    });
  },
  
  // Get database tables
  getDatabaseTables: (connectionId) => {
    if (!connectionId) {
      throw new Error('Connection ID is required for getDatabaseTables');
    }
    return api.get(`/database/tables/${connectionId}`);
  },
  
  // Import from database
  importFromDatabase: (connectionId, tableName) => {
    if (!connectionId || !tableName) {
      throw new Error('Connection ID and table name are required for importFromDatabase');
    }
    return api.post(`/database/import/${connectionId}`, { tableName }, {
      headers: JSON_HEADERS
    });
  },

  // Utility method to check if backend is reachable
  checkServerHealth: async () => {
    try {
      const response = await api.get('/cleaning/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      throw new Error(`Backend server is not reachable: ${error.message}`);
    }
  },

  // Get data preview (added to match your frontend requirement)
  getDataPreview: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getDataPreview');
    }
    return api.get(`/preview/${fileId}`);
  },

  // Download cleaned data (added to match your frontend requirement)
  downloadCleanedData: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for downloadCleanedData');
    }
    return api.get(`/cleaning/${fileId}/download`, {
      responseType: 'blob'
    });
  }
};

// Analytics Service - UPDATED TO MATCH BACKEND CONTROLLER
export const analyticsService = {
  // Comprehensive data analysis - MAIN ENDPOINT
  getAnalyticsData: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getAnalyticsData');
    }
    return api.get(`/analytics/${fileId}/analyze`);
  },

  // Analysis with missing value handling
  analyzeDataWithCleaning: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for analyzeDataWithCleaning');
    }
    return api.get(`/analytics/${fileId}/analyze-with-cleaning`);
  },

  // Quick statistics
  getQuickStats: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getQuickStats');
    }
    return api.get(`/analytics/${fileId}/quick-stats`);
  },

  // Analytics overview
  getAnalyticsOverview: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getAnalyticsOverview');
    }
    return api.get(`/analytics/${fileId}/overview`);
  },

  // Health checks
  healthCheck: (fileId = null) => {
    if (fileId) {
      return api.get(`/analytics/${fileId}/health`);
    }
    return api.get('/analytics/health');
  },

  // Services status
  getServicesStatus: () => {
    return api.get('/analytics/services/status');
  },

  // Test endpoints
  testEndpoint: () => {
    return api.get('/analytics/test');
  },

  testFileEndpoint: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for testFileEndpoint');
    }
    return api.get(`/analytics/test/${fileId}`);
  },

  // Legacy endpoints (for backward compatibility)
  analyzeData: (fileId) => {
    console.warn('⚠️ Using legacy analyzeData endpoint. Use getAnalyticsData instead.');
    return analyticsService.getAnalyticsData(fileId);
  },

  // Data quality insights
  getDataQualityInsights: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getDataQualityInsights');
    }
    return api.get(`/analytics/${fileId}/quality-insights`);
  },

  // Statistical summary
  getStatisticalSummary: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getStatisticalSummary');
    }
    return api.get(`/analytics/${fileId}/statistical-summary`);
  },

  // Correlation analysis
  getCorrelations: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getCorrelations');
    }
    return api.get(`/analytics/${fileId}/correlations`);
  },

  // Outlier detection
  detectOutliers: (fileId, columnName) => {
    if (!fileId) {
      throw new Error('File ID is required for detectOutliers');
    }
    const params = columnName ? { column: columnName } : {};
    return api.get(`/analytics/outliers/${fileId}`, { params });
  },

  // Data distribution analysis
  getDataDistribution: (fileId, columnName) => {
    if (!fileId || !columnName) {
      throw new Error('File ID and column name are required for getDataDistribution');
    }
    return api.get(`/analytics/distribution/${fileId}`, {
      params: { column: columnName }
    });
  },

  // Trend analysis
  analyzeTrends: (fileId, config) => {
    if (!fileId) {
      throw new Error('File ID is required for analyzeTrends');
    }
    return api.post(`/analytics/trends/${fileId}`, config, {
      headers: JSON_HEADERS
    });
  },

  // Pattern recognition
  findPatterns: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for findPatterns');
    }
    return api.get(`/analytics/patterns/${fileId}`);
  },

  // Predictive analytics
  predictiveAnalysis: (fileId, targetColumn) => {
    if (!fileId || !targetColumn) {
      throw new Error('File ID and target column are required for predictiveAnalysis');
    }
    return api.post(`/analytics/predictive/${fileId}`, { targetColumn }, {
      headers: JSON_HEADERS
    });
  },

  // Clustering analysis
  performClustering: (fileId, config) => {
    if (!fileId) {
      throw new Error('File ID is required for performClustering');
    }
    return api.post(`/analytics/clustering/${fileId}`, config, {
      headers: JSON_HEADERS
    });
  },

  // Anomaly detection
  detectAnomalies: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for detectAnomalies');
    }
    return api.get(`/analytics/anomalies/${fileId}`);
  },

  // Data segmentation
  segmentData: (fileId, segmentConfig) => {
    if (!fileId) {
      throw new Error('File ID is required for segmentData');
    }
    return api.post(`/analytics/segmentation/${fileId}`, segmentConfig, {
      headers: JSON_HEADERS
    });
  },

  // Comparative analysis
  compareDatasets: (fileId1, fileId2, comparisonConfig) => {
    if (!fileId1 || !fileId2) {
      throw new Error('Both file IDs are required for compareDatasets');
    }
    return api.post('/analytics/compare', {
      fileId1,
      fileId2,
      ...comparisonConfig
    }, {
      headers: JSON_HEADERS
    });
  },

  // Time series analysis
  timeSeriesAnalysis: (fileId, timeColumn, valueColumn) => {
    if (!fileId || !timeColumn || !valueColumn) {
      throw new Error('File ID, time column, and value column are required for timeSeriesAnalysis');
    }
    return api.post(`/analytics/timeseries/${fileId}`, {
      timeColumn,
      valueColumn
    }, {
      headers: JSON_HEADERS
    });
  },

  // Export analytics results
  exportAnalytics: (fileId, exportConfig) => {
    if (!fileId) {
      throw new Error('File ID is required for exportAnalytics');
    }
    return api.post(`/analytics/export/${fileId}`, exportConfig, {
      responseType: 'blob',
      headers: JSON_HEADERS
    });
  },

  // Get available analytics methods
  getAvailableAnalytics: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getAvailableAnalytics');
    }
    return api.get(`/analytics/available-methods/${fileId}`);
  }
};

// File Service
export const fileService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: FORM_DATA_HEADERS,
      timeout: 60000
    });
  },

  getSupportedFileTypes: () => {
    return api.get('/upload/supported-types');
  },

  healthCheck: () => {
    return api.get('/upload/health');
  },

  getAvailableFiles: () => {
    return api.get('/preview/files');
  },

  getFileInfo: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for getFileInfo');
    }
    return api.get(`/preview/file/${fileId}/info`);
  },

  deleteFile: (fileId) => {
    if (!fileId) {
      throw new Error('File ID is required for deleteFile');
    }
    return api.delete(`/preview/file/${fileId}`);
  }
};

// Health check service
export const healthCheck = {
  system: () => api.get('/upload/health'),
  preview: () => api.get('/preview/health'),
  analytics: () => api.get('/analytics/health'),
  cleaning: () => api.get('/cleaning/health'),
  fullSystem: async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/upload/health'),
        api.get('/preview/health'),
        api.get('/analytics/health'),
        api.get('/cleaning/health')
      ]);
      
      return {
        upload: results[0].status === 'fulfilled' ? results[0].value.data : { status: 'down', error: results[0].reason?.message },
        preview: results[1].status === 'fulfilled' ? results[1].value.data : { status: 'down', error: results[1].reason?.message },
        analytics: results[2].status === 'fulfilled' ? results[2].value.data : { status: 'down', error: results[2].reason?.message },
        cleaning: results[3].status === 'fulfilled' ? results[3].value.data : { status: 'down', error: results[3].reason?.message }
      };
    } catch (error) {
      throw new Error(`System health check failed: ${error.message}`);
    }
  }
};

// Report API methods with enhanced error handling
export const reportService = {
  // Get report status
  getReportStatus: (fileId) => {
    const url = `/api/reports/${fileId}/status`;
    console.log('📡 Calling report status URL:', url);
    return api.get(url).catch(error => {
      console.error('❌ Report status API call failed:', {
        url,
        fileId,
        error: error.message,
        status: error.status
      });
      throw error;
    });
  },
  
  // Generate PDF report
  generatePdfReport: (fileId) => 
    api.post(`/api/reports/${fileId}/pdf/generate`),
  
  // Download PDF report
  downloadPdfReport: (fileId) => 
    api.get(`/api/reports/${fileId}/pdf/download`, { 
      responseType: 'blob',
      timeout: 60000
    }),
  
  // Download Excel/CSV report - FIXED with better error handling
  downloadExcelReport: (fileId) => {
    console.log('📡 Downloading Excel report for file:', fileId);
    return api.get(`/api/reports/${fileId}/excel/download`, { 
      responseType: 'blob',
      timeout: 30000
    }).catch(error => {
      console.error('❌ Excel download API call failed:', {
        fileId,
        error: error.message,
        status: error.status
      });
      throw error;
    });
  },
  
  // Get report preview
  getReportPreview: (fileId) => 
    api.get(`/api/reports/${fileId}/preview`),
  
  // Get report statistics
  getReportStatistics: (fileId) => 
    api.get(`/api/reports/${fileId}/statistics`),
  
  // Get all available reports
  getAvailableReports: () => 
    api.get('/api/reports/available'),
  
  // Get system report stats
  getSystemReportStats: () => 
    api.get('/api/reports/system/stats'),
  
  // Delete report
  deleteReport: (fileId, type) => 
    api.delete(`/api/reports/${fileId}`, { 
      params: { type } 
    }),
  
  // Health check
  healthCheck: () => 
    api.get('/api/reports/health')
};
// Export the api instance for direct use if needed
export { api };

// Default export for backward compatibility
export default { analyticsService, dataService, reportService };