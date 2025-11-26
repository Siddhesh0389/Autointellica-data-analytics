// src/pages/Dashboard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  BarChart3, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Database,
  LineChart, 
  Eye, 
  Brush,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'


const Dashboard = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload Data',
      description: 'Upload CSV, Excel files or connect directly to databases with seamless integration',
      path: '/upload',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Eye,
      title: 'Data Preview',
      description: 'Preview your dataset with intelligent missing value detection and data quality insights',
      path: '/preview',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brush,
      title: 'Data Cleaning',
      description: 'Automatically clean and preprocess your data using AI-powered algorithms',
      path: '/cleaning',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Discover patterns, correlations, and insights with advanced analytics engine',
      path: '/analytics',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Generate comprehensive PDF and Excel reports with beautiful visualizations',
      path: '/reports',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Database,
      title: 'Database Connect',
      description: 'Connect to PostgreSQL, MySQL, and other databases for real-time data analysis',
      path: '/upload',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const stats = [
    { icon: CheckCircle, label: 'Data Accuracy', value: '99.9%' },
    { icon: TrendingUp, label: 'Processing Speed', value: '2x Faster' },
    { icon: Shield, label: 'Security', value: 'Enterprise Grade' },
    { icon: Zap, label: 'Automation', value: 'AI Powered' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Transform Your Data Into
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">
              Actionable Insights
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            AutoIntellica automatically processes your raw data, uncovers hidden patterns, 
            and generates stunning visualizations and reports—all in one intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                to="/upload"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
                Get Started Free
            </Link>
            <a
                href="https://drive.google.com/file/d/your-video-id/view"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors text-center"
            >
                Watch Demo
            </a>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How AutoIntellica Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent platform guides you through the entire data analysis process 
              with automated steps and smart recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  key={index}
                  to={feature.path}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-linear-to-r ${feature.color} shadow-md`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              )
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Transform Your Data?
              </h3>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of data professionals who use AutoIntellica to make better decisions faster.
              </p>
              <Link
                to="/upload"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-colors inline-block"
              >
                Start Your Analysis Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard