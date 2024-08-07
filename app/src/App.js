/*
 * Import libraries
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './services/userServices';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';



/*
 * Components
 */


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <AppHeader />
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
