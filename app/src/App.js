/*
 * Import libraries
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// import { logger } from './logger';
import { AuthProvider } from './services/userServices';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';


/*
 * Components
 */


function App() {
  // // Reset the logger when the app is first opened
  // useEffect(() => {
  //   logger.reset();
  //   logger.info('App has started or refreshed');
  // }, []); // empty dependency array ensures this runs only on initial render (app load)

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
