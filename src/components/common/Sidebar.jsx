// src/components/common/Sidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Upload,
  Eye,
  Brush,
  BarChart3,
  FileText,
  Sparkles,
  X
} from 'lucide-react'

const Sidebar = ({ onClose }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Data' },
    { path: '/preview', icon: Eye, label: 'Data Preview' },
    { path: '/cleaning', icon: Brush, label: 'Data Cleaning' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/reports', icon: FileText, label: 'Reports' }
  ]

  return (
    <div className="w-64 bg-linear-to-b from-purple-900 to-indigo-900 shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AutoIntelli</h1>
              <p className="text-sm text-purple-200">Smart Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-purple-200 hover:text-white hover:bg-purple-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-purple-600 shadow-lg transform scale-105'
                  : 'text-purple-200 hover:bg-purple-700 hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-purple-700">
        <div className="text-center">
          <p className="text-xs text-purple-300">AutoIntelli v1.0</p>
          <p className="text-xs text-purple-400">Smart Data Analytics</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar