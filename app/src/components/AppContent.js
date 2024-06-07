import React from 'react';
import {
  // BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import NavigationTabs from './NavigationTabs';
import MainPage from './MainPage';
import Pipelines from './Pipelines';
import Parameters from './Parameters';
import {
  AppToaster,
  // showInfo,
  // showError,
  // showWarning
} from '../services/toastServices';


const AppContent = () => {
  return (
    <>
      <AppToaster />
      <div className='navigation-tabs'>
        <NavigationTabs />
      </div>
      <div className='app-container'>
        <Switch>
          <Route path="/" exact component={MainPage} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/parameters" component={Parameters} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
