/*
 * Import libraries
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';



/*
 * Components
 */


function App() {
  return (
    <div className="App">
      <Router>
        <AppHeader />
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
