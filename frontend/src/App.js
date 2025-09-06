import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route 
            path="/" 
            element={
              <LandingPage 
                onFileUploaded={setUploadedFile}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                uploadedFile={uploadedFile}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
