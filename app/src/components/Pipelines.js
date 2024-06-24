/*
 * Import libraries
 */

import React, {
  useState,
  useEffect
} from 'react';
import { useHistory } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  showError,
} from '../services/toastServices';
import { workflowServices } from '../services/workflowServices';
// import { datasetServices } from '../services/datasetServices';

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

// Import all JSON files from the "pipelines" folder
const pipelineFiles = importAll(require.context('../../public/pipelines', false, /\.json$/));

/*
 * Components
 */


// Function that transform the pipeline data
const Pipelines = () => {
  // const [datatable, setDatatable] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [loading] = useState(false);

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

  // Define header
  const columns = [
    { field: 'status', header: 'Status' },
    { field: 'title', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'url', header: 'URL' },
    { field: 'action', header: 'Action' },
  ];
  
  return (
    <div className='table-pipelines'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable value={datatable} tableStyle={{ minWidth: '50rem' }}>
            {columns.map((col, i) => (
                <Column key={i} field={col.field} header={col.header} />
            ))}
        </DataTable>
      )}
  </div>
  );
};

// Lunch Button that redirect to "Parameters"
const LunchButton = ({ data }) => {
  const history = useHistory();
  const [navigate, setNavigate] = useState(false);
  const [workflowId, setWorkflowId] = useState({});
  const [attemptId, setAttemptId] = useState(0);
  const [datasetId, setDatasetId] = useState({});
  
  // Navigate to new page
  useEffect(() => {
    if (navigate && datasetId) {
      history.push({
        pathname: `/workflows/${workflowId}/${attemptId}/datasets/${datasetId}`,
        state: { schema: data }
      });
    }
  }, [navigate, history, workflowId, attemptId, datasetId, data]);

  // 1. Lauch Pipeline
  const lauchPipeline = async (data) => {
    const workflowId = await createWorkflow(data);
    if (workflowId) {
      await createDataset(workflowId);
    }
  };

  // 2. Launch the pipeline creating a workflow instance
  const createWorkflow = async (data) => {
    // convert the data pipeline to POST
    let dataPOST = {};
    try {
      dataPOST = {
        name: data.title,
        pipeline: data.url,
        revision: data.revision,
        profiles: 'guess',
        author: 'guess'
      };
    } catch (error) {
      showError('', 'Processing the data for the POST request during workflow creation');
      console.error('Processing the data for the POST request during workflow creation: ', error);
    }
    // make the POST request to create a workflow
    try {
      if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
        const result = await workflowServices.create(dataPOST);
        // const result = {_id: '6667227e22cc1ec8df1e6c14'};
        if (result && result._id) {
          setWorkflowId(result._id);
          setAttemptId(0);
          return result._id;
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

  // 3. Launch the pipeline creating a dataset instance
  const createDataset = async (workflowId) => {
    // convert the data pipeline to POST
    let dataPOST = {};
    try {
      dataPOST = {
        experiment: workflowId
      };
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Processing the data for the POST request during dataset creation: ', error);
    }
    // make the POST request to create a workflow
    try {
      if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
        // const result = await datasetServices.create(dataPOST);
        const result = {_id: '6679609b0a72b1ed9aa9de5d'};
        if (result && result._id) {
          setDatasetId(result._id);
          setNavigate(true); // set state to trigger navigation
          return result._id;
        }
        else {  
          showError('', 'The dataset instance was not created correctly');
          console.error('The dataset id was not provided.');
        }
      }
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Error: making a POST request during dataset creation: ', error);
    }
  };

  return (
    <Button
      label='Launch'
      onClick={() => lauchPipeline(data)}
      raised
    />
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
