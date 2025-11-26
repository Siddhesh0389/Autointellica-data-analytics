// src/components/reports/ReportGenerator.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { reportService } from '../../services/api';
import { 
  Download, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Shield,
  TrendingUp,
  Database,
  FileDown,
  Play
} from 'lucide-react';

const ReportGenerator = () => {
  const { state } = useData();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (state.uploadedFile) {
      checkReportStatus();
      loadReportPreview();
      loadReportStatistics();
    }
  }, [state.uploadedFile]);

  const checkReportStatus = async () => {
    if (!state.uploadedFile) return;

    try {
      const response = await reportService.getReportStatus(state.uploadedFile.id);
      if (response.data.success) {
        setReportStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error checking report status:', error);
      setMessage('Error checking report status: ' + error.message);
    }
  };

  const loadReportPreview = async () => {
    if (!state.uploadedFile) return;

    try {
      const response = await reportService.getReportPreview(state.uploadedFile.id);
      if (response.data.success) {
        setReportPreview(response.data.data);
      }
    } catch (error) {
      console.error('Error loading report preview:', error);
    }
  };

  const loadReportStatistics = async () => {
    if (!state.uploadedFile) return;

    try {
      const response = await reportService.getReportStatistics(state.uploadedFile.id);
      if (response.data.success) {
        setReportStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading report statistics:', error);
    }
  };

  const generatePdfReport = async () => {
    if (!state.uploadedFile) return;

    setGeneratingPdf(true);
    setMessage('');

    try {
      const response = await reportService.generatePdfReport(state.uploadedFile.id);
      
      if (response.data.success) {
        setMessage('PDF report generated successfully!');
        await downloadPdfReport();
        checkReportStatus();
      } else {
        setMessage('Failed to generate PDF report: ' + response.data.message);
      }
    } catch (error) {
      setMessage('Error generating PDF report: ' + error.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const downloadPdfReport = async () => {
    if (!state.uploadedFile) return;

    try {
      const response = await reportService.downloadPdfReport(state.uploadedFile.id);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `data_report_${state.uploadedFile.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setMessage('Error downloading PDF report: ' + error.message);
    }
  };

  const downloadExcelReport = async () => {
    try {
      if (!state.uploadedFile || !state.uploadedFile.id) {
        setMessage('Error: No file selected or file information missing');
        return;
      }

      setDownloadingExcel(true);
      setMessage('');

      const response = await reportService.downloadExcelReport(state.uploadedFile.id);
      
      let filename = 'downloaded_file.csv';
      
      if (state.uploadedFile && state.uploadedFile.name) {
        const baseName = state.uploadedFile.name.replace(/\.csv$/i, '');
        filename = `${baseName}_cleaned.csv`;
      } else if (state.uploadedFile && state.uploadedFile.originalFilename) {
        const baseName = state.uploadedFile.originalFilename.replace(/\.csv$/i, '');
        filename = `${baseName}_cleaned.csv`;
      }
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setMessage('CSV file downloaded successfully!');
      
    } catch (error) {
      let errorMessage = 'Error downloading CSV file: ';
      
      if (error.message.includes('replace')) {
        errorMessage += 'File information is incomplete. Please refresh and try again.';
      } else if (error.message.includes('404')) {
        errorMessage += 'File not found on server. The cleaned file may not exist.';
      } else if (error.message.includes('Network Error')) {
        errorMessage += 'Network connection failed. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setDownloadingExcel(false);
    }
  };

  const refreshAll = () => {
    checkReportStatus();
    loadReportPreview();
    loadReportStatistics();
    setMessage('All data refreshed!');
  };

  if (!state.uploadedFile) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No File Uploaded</h3>
          <p className="text-gray-600">Please upload and process a file to generate reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Report Generator</h1>
              <p className="text-gray-600">
                Generate comprehensive reports from your analyzed data
              </p>
            </div>
          </div>
          <button
            onClick={refreshAll}
            className="flex items-center px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Cleaning Information */}
      {reportStats?.cleaningInfo && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Data Quality Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium">Data Quality</span>
              </div>
              <p className="text-lg font-semibold text-blue-700 mt-1">
                {reportStats.cleaningInfo.dataQuality || 'Unknown'}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium">Cleaning Status</span>
              </div>
              <p className="text-lg font-semibold text-green-700 mt-1">
                {reportStats.cleaningInfo.isCleaned ? 'Cleaned' : 'Original'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                <span className="font-medium">Method</span>
              </div>
              <p className="text-lg font-semibold text-purple-700 mt-1">
                {reportStats.cleaningInfo.isCleaned ? 'Clean' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Report Status */}
      {reportStatus && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Report Status</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                reportStatus.canGenerateReports 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {reportStatus.canGenerateReports ? 'Ready' : 'Processing Required'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              reportStatus.originalFileExists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {reportStatus.originalFileExists ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">Original File</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {reportStatus.originalFileExists ? 'Available' : 'Not Found'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              reportStatus.hasCleanedData 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                {reportStatus.hasCleanedData ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">Cleaned Data</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {reportStatus.hasCleanedData ? 'Available' : 'Not Cleaned'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              reportStatus.canGenerateReports 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
                <span className="font-medium">Report Generation</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {reportStatus.canGenerateReports ? 'Ready' : 'Process Data First'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center">
                <Database className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium">File ID</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 font-mono">
                {reportStatus.fileId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview */}
      {reportPreview && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Report Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{reportPreview.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{reportPreview.totalColumns}</div>
              <div className="text-sm text-gray-600">Total Columns</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{reportPreview.insightsCount}</div>
              <div className="text-sm text-gray-600">Insights</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{reportPreview.correlationsCount}</div>
              <div className="text-sm text-gray-600">Correlations</div>
            </div>
          </div>
        </div>
      )}
      {/* Data Processing Flow */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Data Processing Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm">1. Upload File</h3>
            <p className="text-xs text-gray-600 mt-1">Upload CSV or Excel file</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Play className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm">2. Process Data</h3>
            <p className="text-xs text-gray-600 mt-1">Analyze and clean data</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm">3. Analysis Data</h3>
            <p className="text-xs text-gray-600 mt-1">Insights & Visualization</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm">4. Generate Report</h3>
            <p className="text-xs text-gray-600 mt-1">Create PDF analysis</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-sm">5. Download CSV</h3>
            <p className="text-xs text-gray-600 mt-1">Get cleaned data file</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">File Conversion Note:</h4>
          <p className="text-sm text-gray-600">
            • CSV files are cleaned and downloaded as CSV format<br/>
            • Excel files (.xlsx, .xls) are converted to CSV format during cleaning process<br/>
            • All cleaned data downloads are provided as CSV files for compatibility
          </p>
        </div>
      </div>

      {/* Report Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Generate Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Report */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">PDF Analysis Report</h3>
                <p className="text-sm text-gray-600">Comprehensive report with analytics and insights</p>
              </div>
            </div>
            
            <button
              onClick={generatePdfReport}
              disabled={generatingPdf || !reportStatus?.canGenerateReports}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                generatingPdf || !reportStatus?.canGenerateReports
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {generatingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>

          {/* CSV Export */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800">Cleaned Data Export</h3>
                <p className="text-sm text-gray-600">Download cleaned data as CSV file</p>
              </div>
            </div>
            
            <button
              onClick={downloadExcelReport}
              disabled={downloadingExcel || !reportStatus?.canGenerateReports}
              className={`w-full flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                downloadingExcel || !reportStatus?.canGenerateReports
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {downloadingExcel ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV File
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.includes('successfully') || message.includes('Refreshed')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center">
            {message.includes('successfully') || message.includes('Refreshed') ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message}
          </div>
        </div>
      )}

      {/* Report Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-2">About the Reports</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>PDF Report:</strong> Includes data preview, quality analysis, and analytics insights</li>
          <li>• <strong>CSV Export:</strong> Contains the cleaned dataset in CSV format</li>
          <li>• <strong>File Conversion:</strong> Excel files are converted to CSV during cleaning process</li>
          <li>• <strong>Process Flow:</strong> Upload → Process → Clean → Report → Download CSV</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportGenerator;