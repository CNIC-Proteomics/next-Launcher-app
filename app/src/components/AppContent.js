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
import Dataset from './Dataset';
// import CreateDataset from './CreateDataset';
import Datasets from './Datasets';
import Pipelines from './Pipelines';
import CreateWorkflow from './CreateWorkflow';
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
          */
          }
          <RoleBasedRoute path="/datasets/:id/:operation" component={Dataset} allowedRoles={['guest','admin']} />
          <RoleBasedRoute path="/datasets" component={Datasets} allowedRoles={['guest','admin']} />
          {/* URLs:
            workflows
            workflows/0/0/create
            datasets/:id/:attempt/update{launch}
            datasets/:id/:attempt/view

            <RoleBasedRoute path="/workflows/:workflowId/:attemptId/create" component={CreateWorkflow} allowedRoles={['guest','admin']} />
            <RoleBasedRoute path="/workflows/:workflowId/:attemptId/update" component={UpdateWorkflow} allowedRoles={['guest','admin']} />
            <RoleBasedRoute path="/workflows/:workflowId/:attemptId/view" component={Workflow} allowedRoles={['guest','admin']} />

          */
          }
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId/datasets/:datasetId" component={CreateWorkflow} allowedRoles={['guest','admin']} />
          <RoleBasedRoute path="/workflows/:workflowId/:attemptId" component={Workflow} allowedRoles={['guest','admin']} />
          <RoleBasedRoute path="/workflows" component={Workflows} allowedRoles={['guest','admin']} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/" exact component={MainPage} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
