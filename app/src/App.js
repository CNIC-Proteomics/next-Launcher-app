/*
 * Import libraries
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import AppContent from './components/AppContent';
// import { Toast } from 'primereact/toast';
// import { toastRef } from './services/toastServices';



/*
 * Components
 */

// const AppToaster = () => {
//     return (<Toast ref={toastRef} />);
// };

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
      {/* <AppToaster /> */}
      <Router>
        <AppHeader />
        <AppDescription />
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
