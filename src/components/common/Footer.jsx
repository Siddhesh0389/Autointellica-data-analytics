// src/components/common/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Github, Mail, ExternalLink, Sparkles, LinkedinIcon, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-linear-to-r from-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">AutoIntellica</h3>
                <p className="text-purple-200">Smart Data Analytics Platform</p>
              </div>
            </div>
            <p className="text-purple-200 text-sm mb-6 max-w-md">
              Transform your raw data into actionable insights with AI-powered analytics, 
              automated cleaning, and beautiful visualizations.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Siddhesh0389" className="p-2 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/siddhesh-patil-831010261" className="p-2 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block text-purple-200 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/upload" className="block text-purple-200 hover:text-white transition-colors">Upload Data</Link>
              <Link to="/analytics" className="block text-purple-200 hover:text-white transition-colors">Analytics</Link>
              <Link to="/reports" className="block text-purple-200 hover:text-white transition-colors">Reports</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-purple-200 hover:text-white transition-colors">Documentation</a>
              <a href="#" className="block text-purple-200 hover:text-white transition-colors">Help Center</a>
              <a href="#" className="block text-purple-200 hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="block text-purple-200 hover:text-white transition-colors">Status</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-purple-200 text-sm mb-4 md:mb-0">
              <span>© 2025 AutoIntellica. Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for the data community</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-purple-200">
              <span>v1.0.0</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer