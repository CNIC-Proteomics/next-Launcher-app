/*
 * Import libraries
 */

import React from 'react';
import {
  // BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import {
  AppToaster,
} from '../services/toastServices';
import NavigationTabs from './NavigationTabs';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import RoleBasedRoute from './RoleBasedRoute';
import Pipelines from './Pipelines';
import Parameters from './Parameters';
import Workflows from './Workflows';
import Workflow from './Workflow';


/*
 * Components
 */

const AppDescription = () => {
  return (
    <div className='app-description'>
      {/* Web server for the execution of Nextflow pipelines */}
    </div>
  );
}

const AppContent = () => {
  return (
    <>
      <AppToaster />
      <div className='app-container'>
        <AppDescription />
        <div className='app-navigation-tabs'>
          <NavigationTabs />
        </div>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId/datasets/:datasetId" component={Parameters} allowedRoles={['guess','admin']} />
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId" component={Workflow} allowedRoles={['guess','admin']} />
          <RoleBasedRoute path="/workflows" component={Workflows} allowedRoles={['guess','admin']} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/" exact component={MainPage} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
