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

import {
  ALLOWED_ROLES
} from '../constants';



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
          <RoleBasedRoute path="/user" component={User} allowedRoles={ALLOWED_ROLES} />
          {/* URLs:
            datasets
            datsets/0/create
            datasets/:id/update
            datasets/:id/view ??
          */}
          <RoleBasedRoute path="/datasets/:id/:operation" component={Dataset} allowedRoles={ALLOWED_ROLES} /> {/* creator and updater */}
          <RoleBasedRoute path="/datasets" component={Datasets} allowedRoles={ALLOWED_ROLES} />
          {/* URLs:
            pipelines
            pipelines/:name/create
            pipelines/:name/update/:id/:attempt
          */}
          <RoleBasedRoute path="/pipelines/:pipelineName/create" component={Pipeline} allowedRoles={ALLOWED_ROLES} />
          <RoleBasedRoute path="/pipelines/:pipelineName/update/:workflowId/:attemptId" component={Pipeline} allowedRoles={ALLOWED_ROLES} />
          <Route path="/pipelines" component={Pipelines} />
          {/* URLs:
            workflows/:id/:attempt/view
          */}
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId/view" component={Workflow} allowedRoles={ALLOWED_ROLES} />
          <RoleBasedRoute path="/workflows" component={Workflows} allowedRoles={ALLOWED_ROLES} />
          <Route path="/" exact component={MainPage} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
