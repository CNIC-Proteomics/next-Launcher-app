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
import Pipelines from './Pipelines';
import Parameters from './Parameters';
import Workflows from './Workflows';
import Workflow from './Workflow';


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
          <Route path="/workflows/:workflowId/:attemptId/datasets/:datasetId" component={Parameters} />
          <Route path="/workflows" component={Workflows} />
          <Route path="/workflows/:workflowId/:attemptId" component={Workflow} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
