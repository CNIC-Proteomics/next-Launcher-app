/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import {
  useHistory
} from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { SplitButton } from 'primereact/splitbutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import {
  FilterMatchMode,
} from 'primereact/api';

import {
  CHECK_WORKFLOWS
} from '../constants';

import { workflowServices } from '../services/workflowServices';




/*
 * Components
 */


// Function that transform the pipeline data
const Workflows = () => {
  
  // Define history
  const history = useHistory();

  // Define header
  const columns = [
    { field: 'name', header: 'Name' },
    { field: 'description', header: 'Description' },
    { field: 'author', header: 'Author' },
    { field: 'date_submitted', header: 'Date submitted' },
    { field: 'attempt', header: 'Attempt' },
    { field: 'status', header: 'Status' },
    { field: 'action', header: 'Action' }
  ];

  // Transform timestamp to date
  const timestampToDate = (timestamp) => {
    // convert the timestamp to a Date object
    const date = new Date(timestamp);
  
    // get the day, month, and year from the Date object
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // format the date as dd/mm/yyyy hh:mm:ss
    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;  
  
    return formattedDateTime;
  };

  // GET request with the workflows information
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
	// ref to track if data has been fetched
  const hasWkfData = useRef(false);
	const wkfIntervalRef = useRef(null);


  useEffect(() => {

    // transform the data for the table
    const transformData = (data) => {
      let result = [];

      data.forEach(item => {
        const { name, description, author, attempts } = item;
        attempts.forEach(attempt => {
          const { date_submitted, id, status } = attempt;
          result.push({
            name,
            description,
            author,
            'date_submitted': timestampToDate(date_submitted),
            'attempt': id,
            status,
            'action': <ActionButton data={item} attempt={id} />
          });
        });
      });

      return result;
    };

    // get the workflows
    const fetchWorkflows = async () => {
      try {
          const data = await workflowServices.get();
          if (data === null) {
            history.push('/login');
            return;
          }
          setWorkflows(transformData(data));
          setLoading(false);
      } catch (error) {
          console.error('Error fetching workflows:', error);
          setLoading(false);
      }
    };

    if (!hasWkfData.current) {
      fetchWorkflows();
      hasWkfData.current = true; // mark as fetched
    }

    // Set up the interval to update the log text
    wkfIntervalRef.current = setInterval(() => {
      fetchWorkflows();
    }, CHECK_WORKFLOWS);
    
    // Clean up the interval on component unmount
    return () => {
      if (wkfIntervalRef.current) {
        clearInterval(wkfIntervalRef.current);
      }
    };

  }, [history]);

  
  // Develop the search filter in the datatable
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };
  const statusBodyTemplate = (rowData) => {
    return <StatusMessage status={rowData.status} />;
  };

  // Header
  const renderHeader = () => {
    return (
        <div className="table-workflows-search flex justify-content-end">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </IconField>
        </div>
    );
  };
  const header = renderHeader();

  // Selected workflows
  const [selectedWorkflows, setSelectedWorkflows] = useState(null);

  return (
    <div className='table-workflows'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        <>
        <DataTable
          size='small'
          value={workflows}
          header={header}
          filters={filters}
          globalFilterFields={columns.map(c => c.field)}
          paginator rows={20} rowsPerPageOptions={[5, 10, 20]}
          selectionMode={'checkbox'} selection={selectedWorkflows} onSelectionChange={(e) => setSelectedWorkflows(e.value)}>
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          {columns.map((col, i) => (
              <Column
                sortable
                key={i}
                field={col.field}
                header={col.header}
                body={col.field === 'status' ? statusBodyTemplate : undefined}
              />
          ))}
        </DataTable>
        </>
      )}
  </div>
  );
};

const StatusMessage = ({ status }) => {
  const severity = {
    'running': 'info',
    'completed': 'success',
    'failed': 'error',
  }[status];

  return ( <Message severity={severity} text={status} /> );
};

const ActionButton = ({ data, attempt }) => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/workflows/${data._id}/${attempt}`
      });
    }
  }, [navigate, history, data, attempt]);

  // const items = [
  //   {
  //       label: 'Option 1',
  //       icon: 'pi pi-ellipsis-v',
  //       command: () => {
  //           console.log('Option 1 clicked');
  //       }
  //   }
  // ];
  const items = [];
  const onClick = () => {
      setNavigate(true);

  };
  return ( <SplitButton label="Open" icon="pi pi-caret-right" dropdownIcon="pi pi-ellipsis-v" onClick={onClick} model={items} /> );
};

export default Workflows;
