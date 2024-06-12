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
          <Route path="/workflows" component={Workflows} />
          {/* <Route path="/workflows/:workflowId" component={Workflow} /> */}
          <Route path="/workflows/:workflowId/datasets/:datasetId" component={Parameters} />
        </Switch>
      </div>
    </>
  );
};

export default AppContent;
