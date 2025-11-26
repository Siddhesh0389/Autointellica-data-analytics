// src/components/common/Navbar.jsx
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, User, Sparkles, Menu, X, Github, Mail, Linkedin } from 'lucide-react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'Upload Data', href: '/upload', current: location.pathname === '/upload' },
    { name: 'Data Preview', href: '/preview', current: location.pathname === '/preview' },
    { name: 'Data Cleaning', href: '/cleaning', current: location.pathname === '/cleaning' },
    { name: 'Analytics', href: '/analytics', current: location.pathname === '/analytics' },
    { name: 'Reports', href: '/reports', current: location.pathname === '/reports' },
  ]

  const userLinks = [
    { 
      name: 'GitHub', 
      href: 'https://github.com/Siddhesh0389', 
      icon: Github,
      color: 'text-gray-700 hover:text-gray-900'
    },
    { 
      name: 'Email', 
      href: 'mailto:siddhesh110322@gmail.com', 
      icon: Mail,
      color: 'text-red-600 hover:text-red-800'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://www.linkedin.com/in/siddhesh-patil-831010261', 
      icon: Linkedin,
      color: 'text-blue-600 hover:text-blue-800'
    }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-linear-to-r from-purple-600 to-indigo-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-purple-600">AutoIntellica</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Data Analytics</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* User dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="w-8 h-8 bg-linear-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div 
                  className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  onMouseEnter={() => setUserMenuOpen(true)}
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Developer</p>
                    <p className="text-sm text-gray-500">Siddhesh Patil</p>
                  </div>
                  
                  <div className="py-2">
                    {userLinks.map((link) => {
                      const IconComponent = link.icon
                      return (
                        <a
                          key={link.name}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                        >
                          <IconComponent className={`w-4 h-4 mr-3 ${link.color}`} />
                          <span className="text-gray-700">{link.name}</span>
                        </a>
                      )
                    })}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Connect with me</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar