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


const AppDescription = () => {
  return (
    <div className='app-description'>
      Web server for the execution of Nextflow pipelines
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <AppHeader />
        <AppDescription />
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
