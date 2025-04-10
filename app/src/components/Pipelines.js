/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useContext,
} from 'react';
import { useHistory } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

import { PIPELINES_LIST } from '../constants';
import { userServices } from '../services/userServices';



/*
 * Components
 */


/**
 * Piperlines
 * COmponent that create the pipelines table
 * @returns
 */
// Function that transform the pipeline data
const Pipelines = () => {
  
  // Declare variables
  const { auth } = useContext(userServices);
  const [loading, setLoading] = useState(false);
  const [datatable, setDatatable] = useState([]);

  // Perform actions outside the main scope
  useEffect(() => {
    // transform the data pipeline for the table
    const convertDataToTable = (data) => ({
      id: data.$id,
      status: <StatusIcon status={data.status} />,
      title: data.title,
      revision: data.revision,
      description: data.description,
      url: <UrlLink url={data.url} />,
      action: <LunchButton data={data} auth={auth} />
    });

    const data = PIPELINES_LIST.map(convertDataToTable);
    setDatatable(data);
    setLoading(false);
  }, [auth]);
  
  // Define header
  const columns = [
    { field: 'status', header: 'Status' },
    { field: 'title', header: 'Title' },
    { field: 'revision', header: 'Release' },
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



/**
 * LunchButton
 * Create Launch button for pipeline
 * @param {Object} data - workflow data
 * @returns 
 */
// Lunch Button that redirect to "Parameters"
const LunchButton = ({ data }) => {
  const [navigate, setNavigate] = useState(false);
  const history = useHistory();
  
  // Navigate to parameter form
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/pipelines/${data.title}/create`,
        // state: { schema: data }
      });
    }
  }, [navigate, history, data]);

  // Lauch Pipeline (if user is authenticathed)
  const lauchPipeline = () => {
    setNavigate(true); // set state to trigger navigation
  };

  // Render
  return (
    <Button
      label='Launch'
      onClick={() => lauchPipeline()}
      raised
    />
  );
};




/**
 * StatusIcon
 * Provide icon of pipeline status.
 * @param {String} status
 * @returns 
 */
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




/**
 * UrlLink
 * 
 * @param {String} url 
 * @returns 
 */
const UrlLink = ({ url }) => (
  <div className="flex gap-1">
    <a href={url} target='_blank' rel="noopener noreferrer">{url}</a>
    <i className='pi pi-external-link' style={{ fontSize: '0.6rem' }}></i>
  </div>
);

export default Pipelines;
