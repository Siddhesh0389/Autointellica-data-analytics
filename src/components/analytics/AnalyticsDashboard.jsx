// src/components/analytics/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { analyticsService, dataService } from '../../services/api';

// Correct imports for Recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, 
  FunnelChart, 
  Funnel
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  RefreshCw,
  Database,
  Target,
  Zap,
  BarChart as BarChartIcon,
  Activity,
  RadarIcon
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const { state } = useData();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dataSource, setDataSource] = useState('');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    if (state.uploadedFile) {
      loadAnalyticsData();
    }
  }, [state.uploadedFile]);

  const loadAnalyticsData = async () => {
    if (!state.uploadedFile) {
      setError('No file uploaded. Please upload a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setDataSource('');

    try {
      console.log('Loading analytics for file:', state.uploadedFile.id);
      
      let response;
      let source = '';
      
      try {
        response = await analyticsService.getAnalyticsData(state.uploadedFile.id);
        source = 'analytics';
        console.log('✅ Using analytics endpoint');
      } catch (analyticsError) {
        try {
          response = await analyticsService.getAnalyticsOverview(state.uploadedFile.id);
          source = 'overview';
          console.log('✅ Using overview endpoint');
        } catch (overviewError) {
          try {
            response = await analyticsService.getQuickStats(state.uploadedFile.id);
            source = 'quick-stats';
            console.log('✅ Using quick stats endpoint');
          } catch (quickStatsError) {
            response = await dataService.getDataQualityReport(state.uploadedFile.id);
            source = 'data-quality';
            console.log('✅ Using data quality endpoint');
          }
        }
      }

      if (response.data) {
        const apiResponse = response.data;
        
        if (apiResponse.success === false) {
          throw new Error(apiResponse.message || 'Analytics request failed');
        }
        
        let data;
        if (apiResponse.data) {
          data = apiResponse.data;
        } else {
          data = apiResponse;
        }

        console.log('📊 Analytics data received:', data);
        console.log('📈 Charts data from backend:', data.charts);

        const transformedData = transformAnalyticsData(data, source);
        setAnalyticsData(transformedData);
        setDataSource(source);
        
      } else {
        throw new Error('No data received from analytics service');
      }
    } catch (error) {
      console.error('Analytics error:', error);
      const errorMessage = error.message || 'Failed to load analytics data';
      
      if (errorMessage.toLowerCase().includes('generated') || 
          errorMessage.toLowerCase().includes('success') ||
          errorMessage.toLowerCase().includes('completed')) {
        setError(`Analytics data loaded: ${errorMessage}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const transformAnalyticsData = (rawData, source) => {
    if (rawData.insights && rawData.summaryStats) {
      return {
        ...rawData,
        source: 'analytics',
        message: rawData.message || 'Comprehensive analytics data'
      };
    }

    switch (source) {
      case 'data-quality':
        return transformDataQualityReport(rawData);
      case 'quick-stats':
        return transformQuickStats(rawData);
      case 'overview':
        return transformOverviewData(rawData);
      default:
        return transformGenericData(rawData, source);
    }
  };

  const transformDataQualityReport = (qualityData) => {
    const insights = [];
    const summaryStats = {
      dataQualityScore: qualityData.dataQualityScore || 0,
      totalRows: qualityData.totalRows || 0,
      totalColumns: qualityData.totalColumns || 0,
      missingValues: qualityData.missingValues || 0,
      numericColumns: qualityData.numericColumns || 0,
      textColumns: qualityData.textColumns || 0,
      usingCleanedData: qualityData.usingCleanedData || false,
      columns: qualityData.columns || []
    };

    if (summaryStats.dataQualityScore >= 90) {
      insights.push({
        title: 'Excellent Data Quality',
        description: 'Your dataset meets high quality standards',
        value: `${summaryStats.dataQualityScore}% quality score`,
        type: 'success'
      });
    } else if (summaryStats.dataQualityScore >= 70) {
      insights.push({
        title: 'Good Data Quality',
        description: 'Your dataset is suitable for analysis',
        value: `${summaryStats.dataQualityScore}% quality score`,
        type: 'info'
      });
    } else {
      insights.push({
        title: 'Data Quality Needs Improvement',
        description: 'Consider data cleaning for better analysis',
        value: `${summaryStats.dataQualityScore}% quality score`,
        type: 'warning'
      });
    }

    if (summaryStats.missingValues > 0) {
      insights.push({
        title: 'Missing Values Detected',
        description: `${summaryStats.missingValues} missing values found`,
        value: 'Use data cleaning to handle missing values',
        type: 'warning'
      });
    }

    insights.push({
      title: 'Dataset Overview',
      description: `${summaryStats.totalRows} rows × ${summaryStats.totalColumns} columns`,
      value: `${summaryStats.numericColumns} numeric, ${summaryStats.textColumns} text columns`,
      type: 'info'
    });

    return {
      insights,
      summaryStats,
      correlations: qualityData.correlations || [],
      charts: qualityData.charts || [],
      message: 'Data quality analysis report',
      source: 'data-quality'
    };
  };

  const transformQuickStats = (quickStats) => {
    const insights = [];
    const summaryStats = {
      dataQualityScore: quickStats.completenessScore || quickStats.dataQualityScore || 0,
      totalRows: quickStats.totalRows || 0,
      totalColumns: quickStats.totalColumns || 0,
      missingValues: quickStats.missingValueCount || quickStats.missingValues || 0,
      numericColumns: quickStats.numericColumns || 0,
      textColumns: quickStats.textColumns || 0,
      usingCleanedData: quickStats.isCleaned || quickStats.usingCleanedData || false
    };

    insights.push({
      title: 'Quick Analysis',
      description: 'Basic dataset statistics',
      value: quickStats.analysisReady ? 'Ready for analysis' : 'Needs preparation',
      type: 'info'
    });

    return {
      insights,
      summaryStats,
      correlations: [],
      charts: quickStats.charts || [],
      message: 'Quick statistics overview',
      source: 'quick-stats'
    };
  };

  const transformOverviewData = (overviewData) => {
    const stats = overviewData.stats || overviewData;
    const fileInfo = overviewData.fileInfo || {};

    const insights = [];
    const summaryStats = {
      dataQualityScore: stats.completenessScore || stats.dataQualityScore || 0,
      totalRows: fileInfo.totalRows || stats.totalRows || 0,
      totalColumns: fileInfo.totalColumns || stats.totalColumns || 0,
      missingValues: stats.missingValues || stats.missingValueCount || 0,
      numericColumns: stats.numericColumns || 0,
      textColumns: stats.textColumns || 0,
      usingCleanedData: fileInfo.isCleaned || stats.usingCleanedData || false,
      columns: stats.columns || []
    };

    insights.push({
      title: 'Analytics Overview',
      description: 'Comprehensive data analysis',
      value: `Analysis ${overviewData.analysisReady ? 'ready' : 'pending'}`,
      type: 'info'
    });

    return {
      insights,
      summaryStats,
      correlations: overviewData.correlations || [],
      charts: overviewData.charts || [],
      message: overviewData.message || 'Analytics overview',
      source: 'overview'
    };
  };

  const transformGenericData = (rawData, source) => {
    const insights = [];
    const summaryStats = {
      dataQualityScore: rawData.dataQualityScore || rawData.completenessScore || 0,
      totalRows: rawData.totalRows || 0,
      totalColumns: rawData.totalColumns || 0,
      missingValues: rawData.missingValues || rawData.missingValueCount || 0,
      numericColumns: rawData.numericColumns || 0,
      textColumns: rawData.textColumns || 0,
      usingCleanedData: rawData.usingCleanedData || rawData.isCleaned || false,
      columns: rawData.columns || []
    };

    insights.push({
      title: 'Data Analysis',
      description: 'Dataset analysis completed',
      value: `Source: ${source}`,
      type: 'info'
    });

    return {
      insights,
      summaryStats,
      correlations: rawData.correlations || [],
      charts: rawData.charts || [],
      message: rawData.message || 'Analytics data',
      source: source
    };
  };

  // Render backend charts properly
  const renderBackendCharts = () => {
    if (!analyticsData?.charts || analyticsData.charts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Charts Generated</h3>
          <p className="text-gray-600">Charts will be generated when you analyze your data.</p>
          <button
            onClick={loadAnalyticsData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Charts
          </button>
        </div>
      );
    }

    console.log('Rendering backend charts:', analyticsData.charts);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analyticsData.charts.map((chart, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-4">
                {getChartIcon(chart.chartType)}
                <h3 className="text-lg font-bold text-gray-800 ml-2">{chart.title}</h3>
              </div>
              <div className="h-64">
                {renderChartByType(chart)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

 // Update getChartIcon to include new chart types
const getChartIcon = (chartType) => {
    switch (chartType) {
        case 'bar': return <BarChartIcon className="w-5 h-5 text-blue-500" />;
        case 'line': return <LineChartIcon className="w-5 h-5 text-green-500" />;
        case 'pie': return <PieChartIcon className="w-5 h-5 text-purple-500" />;
        case 'scatter': return <BarChart3 className="w-5 h-5 text-orange-500" />;
        case 'radar': return <RadarIcon className="w-5 h-5 text-red-500" />;
        case 'composed': return <BarChart3 className="w-5 h-5 text-indigo-500" />;
        case 'funnel': return <BarChart3 className="w-5 h-5 text-pink-500" />;
        case 'treemap': return <BarChart3 className="w-5 h-5 text-teal-500" />;
        default: return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
};

 // Update the renderChartByType method to handle new chart types
const renderChartByType = (chart) => {
    if (!chart) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Chart configuration error
            </div>
        );
    }

    try {
        switch (chart.chartType) {
            case 'bar':
                return renderBarChart(chart);
            case 'line':
                return renderLineChart(chart);
            case 'pie':
                return renderPieChart(chart);
            case 'scatter':
                return renderScatterChart(chart);
            case 'radar':
                return renderRadarChart(chart);
            case 'funnel':
                return renderFunnelChart(chart);
            case 'treemap':
                return renderTreemapChart(chart);
            default:
                return (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Unsupported chart type: {chart.chartType}
                    </div>
                );
        }
    } catch (error) {
        console.error('Error rendering chart:', error);
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                Error rendering {chart.title}
            </div>
        );
    }
};

// Update renderBarChart to handle the new "Column Values Overview" chart
const renderBarChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    // Special handling for Column Statistics Overview (multiple series)
    if (chart.title === 'Column Statistics Overview' && chart.series && chart.series.length > 0) {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={70}
                    />
                    <YAxis />
                    <Tooltip 
                        formatter={(value) => [value, 'Value']}
                    />
                    <Legend />
                    {chart.series.map((series, index) => (
                        <Bar 
                            key={index}
                            dataKey="value"
                            name={series.name}
                            fill={series.color || COLORS[index % COLORS.length]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        );
    }

    // Default bar chart rendering
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey={chart.xAxisKey || "name"} 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {chart.series?.map((series, index) => (
                    <Bar 
                        key={index}
                        dataKey={series.dataKey || "value"}
                        name={series.name}
                        fill={series.color || COLORS[index % COLORS.length]}
                    />
                )) || (
                    <Bar dataKey="value" fill={COLORS[0]} name="Value" />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
};;

  // Special renderer for Column Statistics with min, max, mean
  const renderColumnStatisticsChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No column statistics available</div>;
    }

    // Transform data to use min, max, mean if available
    const transformedData = chartData.map(item => {
      // Extract numeric values from the data
      const min = item.min || item.minValue || item.Min || 0;
      const max = item.max || item.maxValue || item.Max || 0;
      const mean = item.mean || item.Mean || item.average || 0;
      
      return {
        name: item.name,
        Min: typeof min === 'number' ? min : 0,
        Max: typeof max === 'number' ? max : 0,
        Mean: typeof mean === 'number' ? mean : 0
      };
    });

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Min" fill="#FF8042" name="Minimum" />
          <Bar dataKey="Max" fill="#0088FE" name="Maximum" />
          <Bar dataKey="Mean" fill="#00C49F" name="Mean" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={chart.xAxisKey || "name"}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {chart.series?.map((series, index) => (
            <Line 
              key={index}
              type="monotone"
              dataKey={series.dataKey || "value"}
              name={series.name}
              stroke={series.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: series.color || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
            />
          )) || (
            <Line 
              type="monotone"
              dataKey="value"
              stroke={COLORS[0]}
              strokeWidth={2}
              dot={{ fill: COLORS[0], strokeWidth: 2, r: 4 }}
              name="Value"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" name="X" />
          <YAxis dataKey="y" type="number" name="Y" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter 
            data={chartData} 
            fill={COLORS[0]} 
            name="Data Points"
          />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderRadarChart = (chart) => {
    const chartData = chart.data || [];
    
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar
            name="Strength"
            dataKey="strength"
            stroke={COLORS[0]}
            fill={COLORS[0]}
            fillOpacity={0.6}
          />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

// Alternative simpler Funnel Chart implementation if above doesn't work
const renderFunnelChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No correlation data available</div>;
    }

    const colors = ['#8B5CF6', '#F59E0B', '#10B981'];

    // Create a custom funnel-like visualization using BarChart
    const funnelData = chartData.map((item, index) => ({
        ...item,
        // Create decreasing widths for funnel effect
        width: 100 - (index * 25)
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    tick={{ fontSize: 12 }}
                />
                <Tooltip 
                    formatter={(value) => [`${value}%`, 'Correlation Strength']}
                />
                <Bar 
                    dataKey="value" 
                    background={{ fill: '#f0f0f0' }}
                >
                    {funnelData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={colors[index % colors.length]} 
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

const renderTreemapChart = (chart) => {
    const chartData = chart.series?.[0]?.data || chart.data || [];
    
    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No column data available</div>;
    }

    // Purple gradient shades from dark to light
    const purpleGradient = ['#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];
    
    // Transform data and sort by value for consistent color assignment
    const treemapData = chartData
        .filter(item => item && item.name && !isNaN(parseFloat(item.value)))
        .map(item => ({
            name: item.name,
            size: Math.abs(parseFloat(item.value)),
            value: parseFloat(item.value),
            ...(item.extra || {})
        }))
        .sort((a, b) => b.size - a.size); // Sort by size for consistent coloring

    if (treemapData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">Invalid treemap data</div>;
    }

    // Calculate color based on position in sorted array (largest = darkest)
    const coloredData = treemapData.map((item, index) => ({
        ...item,
        color: purpleGradient[Math.min(index, purpleGradient.length - 1)]
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <Treemap
                data={coloredData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#f8fafc"
                strokeWidth={1}
            >
                <Tooltip 
                    formatter={(value, name) => {
                        if (name === 'size') {
                            return [value.toFixed(2), 'Value Size'];
                        }
                        return [value, name];
                    }}
                    labelFormatter={(label) => `Column: ${label}`}
                />
            </Treemap>
        </ResponsiveContainer>
    );
};

  // Charts rendering function
  const renderCharts = () => {
    if (!analyticsData) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Please load analytics data first.</p>
        </div>
      );
    }

    return renderBackendCharts();
  };

  // Utility functions
  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getCorrelationColor = (strength) => {
    if (strength >= 0.8) return 'text-red-600 bg-red-50';
    if (strength >= 0.6) return 'text-orange-600 bg-orange-50';
    if (strength >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  // Keep the existing renderOverview function exactly as you have it
  const renderOverview = () => {
    if (!analyticsData) return null;

    const { insights = [], summaryStats = {}, correlations = [] } = analyticsData;

    return (
      <div className="space-y-6">
        {/* Data Source Indicator */}
        {dataSource && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-blue-700">
                  <strong>Data source:</strong> {dataSource}
                  {analyticsData.message && ` - ${analyticsData.message}`}
                </span>
              </div>
              {summaryStats.usingCleanedData && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Using Cleaned Data
                </span>
              )}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Quality</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {summaryStats.dataQualityScore || 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {summaryStats.usingCleanedData ? 'Cleaned dataset' : 'Original dataset'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dataset Size</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {summaryStats.totalRows || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{summaryStats.totalColumns || 0} columns</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missing Values</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {summaryStats.missingValues || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {((summaryStats.missingValues / ((summaryStats.totalRows || 1) * (summaryStats.totalColumns || 1))) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Correlations</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {correlations.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Significant relationships</p>
          </div>
        </div>

        {/* Insights Grid */}
        {insights.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Zap className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Data Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{insight.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{insight.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Correlations List */}
        {correlations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Top Correlations</h3>
            </div>
            <div className="space-y-3">
              {correlations.slice(0, 5).map((corr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">
                      {corr.column1} ↔ {corr.column2}
                    </p>
                    <p className="text-gray-600 text-xs capitalize">
                      {corr.type} {corr.interpretation?.toLowerCase() || 'correlation'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getCorrelationColor(corr.strength)}`}>
                    {corr.correlationCoefficient?.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Analytics</h3>
          <p className="text-gray-600">Crunching numbers and generating insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isSuccessMessage = error.toLowerCase().includes('generated') || 
                            error.toLowerCase().includes('success') ||
                            error.toLowerCase().includes('completed');

    return (
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-xl p-6 ${
          isSuccessMessage 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center mb-4">
            {isSuccessMessage ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <h3 className={`text-xl font-semibold ${
              isSuccessMessage ? 'text-green-800' : 'text-red-800'
            }`}>
              {isSuccessMessage ? 'Analytics Info' : 'Analytics Error'}
            </h3>
          </div>
          <p className={isSuccessMessage ? 'text-green-700' : 'text-red-700'}>{error}</p>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={loadAnalyticsData}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                isSuccessMessage
                  ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {isSuccessMessage ? 'Load Data' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-4">Upload and process your data to see analytics insights</p>
          <button
            onClick={loadAnalyticsData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Load Analytics
          </button>
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
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-600">
                {analyticsData.message || 'Comprehensive data analysis and insights'}
                {dataSource && ` • Source: ${dataSource}`}
              </p>
            </div>
          </div>
          <button
            onClick={loadAnalyticsData}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Target },
              { id: 'charts', name: 'Charts', icon: BarChartIcon },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'charts' && renderCharts()}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;