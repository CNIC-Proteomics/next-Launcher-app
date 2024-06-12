/*
 * Import libraries
 */

import React, {
  useState,
  useEffect
} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';
import {
  showError,
} from '../services/toastServices';
// import { workflowServices } from '../services/workflowServices';
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

/*
 * Components
 */


// Function that transform the pipeline data
const Workflows = () => {

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


export default Workflows;
