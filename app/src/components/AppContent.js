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
import RoleBasedRoute from './RoleBasedRoute';
import NavigationTabs from './NavigationTabs';
import MainPage from './MainPage';
import Login from './Login';
import Register from './Register';
import User from './User';
import Datasets from './Datasets';
import Dataset from './Dataset';
import Pipelines from './Pipelines';
import Pipeline from './Pipeline';
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
          <RoleBasedRoute path="/user" component={User} allowedRoles={['guest','admin']} />
          {/* URLs:
            datasets
            datsets/0/create
            datasets/:id/update
            datasets/:id/view ??
          */}
          <RoleBasedRoute path="/datasets/:id/:operation" component={Dataset} allowedRoles={['guest','admin']} /> {/* creator and updater */}
          <RoleBasedRoute path="/datasets" component={Datasets} allowedRoles={['guest','admin']} />
          {/* URLs:
            pipelines
            pipelines/0/0/create
          */}
          <RoleBasedRoute path="/pipelines/:pipelineName/create" component={Pipeline} allowedRoles={['guest','admin']} />
          <Route path="/pipelines" component={Pipelines} />
          {/* URLs:
            workflows/:id/:attempt/update{launch}
            workflows/:id/:attempt/view
          */}
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId/view" component={Workflow} allowedRoles={['guest','admin']} />
          <RoleBasedRoute path="/workflows" component={Workflows} allowedRoles={['guest','admin']} />
          <Route path="/" exact component={MainPage} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
