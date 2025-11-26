// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Dashboard from './pages/Dashboard'
import DataUpload from './pages/DataUpload'
import DataPreview from './pages/DataPreview'
import DataCleaning from './pages/DataCleaning'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import { DataProvider } from './context/DataContext'
import './styles/globals.css'

function App() {
  return (
    <DataProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-linear-to-br from-purple-50 to-indigo-50">
          {/* Navbar - Fixed at top */}
          <Navbar />
          
          {/* Main content - Scrollable */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DataUpload />} />
              <Route path="/preview" element={<DataPreview />} />
              <Route path="/cleaning" element={<DataCleaning />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
          
          {/* Footer - Always at bottom */}
          <Footer />
        </div>
      </Router>
    </DataProvider>
  )
}

export default App