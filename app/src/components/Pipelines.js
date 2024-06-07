/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';
// import { workflowServices } from '../services/workflowServices';
import {
  showError,
} from '../services/toastServices';

/*
 * Constants
 */


// Function to import JSON files dynamically
const importAll = (r) => {
  let pipelines = [];
  r.keys().forEach(key => {
    pipelines.push(r(key));
  });
  return pipelines;
}

/*
 * Components
 */


// Import all JSON files from the "pipelines" folder
const pipelineFiles = importAll(require.context('../../public/pipelines', false, /\.json$/));

// Lunch Button that redirect to "Parameters"
const LunchButton = ({ data }) => {
  const history = useHistory();
  const [navigate, setNavigate] = useState(false);
  const [workflowId, setWorkflowId] = useState({});
  const navigateRef = useRef(navigate); // added a useRef hook to keep track of the navigate state to prevent repeated navigation attempts.

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (navigateRef.current) {
      history.push({
        pathname: '/parameters',
        state: { schema: data, workflowId: workflowId }
      });
    }
  }, [workflowId, history, data]);


  // Launch the pipeline creating a workflow instance
  const launchPipeline = async (data) => {
    // convert the data pipeline to POST
    let dataPOST = {};
    try {
      dataPOST = {
        pipeline: data.url,
        revision: data.revision,
        profiles: 'guess',
      };
    } catch (error) {
      showError('', 'Processing the data for the POST request during workflow creation');
      console.error('Processing the data for the POST request during workflow creation: ', error);
    }
    // make the POST request to create a workflow
    try {
      if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
        // const result = await workflowServices.create(dataPOST);
        const result = {_id: '66633eea16729f51f38e8e65'};
        if (result && result._id) {
          setWorkflowId(result._id);
          setNavigate(true); // Set state to trigger navigation
        }
        else {  
          showError('', 'The workflow instance was not created correctly');
          console.error('The workflow id was not provided.');
        }
      }
    } catch (error) {
      showError('', 'Processing the data for the POST request during workflow creation');
      console.error('Error: making a POST request during workflow creation: ', error);
    }
  };

  return (
    <Button
      label='Launch'
      onClick={() => launchPipeline(data)}
      raised
    />
  );
};

// Function that transform the pipeline data
const Pipelines = () => {

  // Define header
  const columns = [
    { field: 'status', header: 'Status' },
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'url', header: 'URL' },
    { field: 'action', header: 'Action' },
  ];

  // Transform the data pipeline for the table
  const convertDataToTable = (data) => ({
    id: data.$id,
    status: <StatusIcon status={data.status} />,
    title: data.title,
    description: data.description,
    url: <UrlLink url={data.url} />,
    action: <LunchButton data={data} />
  });

  const [datatable] = useState(pipelineFiles.map(convertDataToTable));

  return (
    <div className='table-pipelines'>
      <DataTable value={datatable} tableStyle={{ minWidth: '50rem' }}>
          {columns.map((col, i) => (
              // <Column key={i} field={col.field} header={col.header} headerStyle={{display:'none'}} />
              <Column key={i} field={col.field} header={col.header} />
          ))}
      </DataTable>
  </div>
  );
};

const StatusIcon = ({ status }) => {
  const iconClass = {
    0: 'pi pi-check-circle',
    1: 'pi pi-exclamation-triangle',
    2: 'pi pi-exclamation-triangle',
    default: 'pi pi-question-circle'
  }[status];
  const color = {
    0: 'green',
    1: 'orange',
    2: 'red',
    default: 'blue'
  }[status];

  return <i className={iconClass} style={{ color }}></i>;
};

const UrlLink = ({ url }) => (
  <div className="flex gap-1">
    <a href={url} target='_blank' rel="noopener noreferrer">{url}</a>
    <i className='pi pi-external-link' style={{ fontSize: '0.6rem' }}></i>
  </div>
);


export default Pipelines;
