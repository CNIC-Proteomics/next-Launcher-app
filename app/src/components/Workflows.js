/*
 * Import libraries
 */

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { SplitButton } from 'primereact/splitbutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

import { CHECK_WORKFLOWS } from '../constants';
import { showInfo, showError, showWarning } from '../services/toastServices';
import { userServices } from '../services/userServices';
import { workflowServices } from '../services/workflowServices';





/**
 * Workflows component
 * Create the workflow table
 * @returns 
 */
const Workflows = () => {
  
  // Declare context
	const { auth } = useContext(userServices);

  // Define history
  // const history = useHistory();


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


	// // Transform the data for the table
	// const transformData = (data) => {
	// 	let result = [];
	// 	data.forEach(item => {
	// 		const { _id, name, description, author, attempts } = item;
	// 		attempts.forEach(attempt => {
	// 			const { date_submitted, id, status } = attempt;
	// 			result.push({
	// 				_id,
	// 				name,
	// 				description,
	// 				author,
	// 				'date_submitted': timestampToDate(date_submitted),
	// 				'attempt': id,
	// 				status,
	// 				'action': <ActionButton data={item} attempt={id} />
	// 			});
	// 		});
	// 	});
	// 	return result;
	// };


	// // Get the workflows
	// const fetchWorkflows = async () => {
	// 	try {
	// 			const data = await workflowServices.get();
	// 			if (data !== null) {
	// 				setWorkflows(transformData(data));
	// 				setLoading(false);
	// 			}
	// 	} catch (error) {
	// 			console.error('Error fetching workflows:', error);
	// 			setLoading(false);
	// 	}
	// };
	// Get the workflows
	// with useCallback: Memoize the fetchWorkflows function
  const fetchWorkflows = useCallback(async () => {
		// transform the data for the table
		const transformData = (data) => {
			let result = [];
			data.forEach(item => {
				const { _id, name, description, author, attempts } = item;
				attempts.forEach(attempt => {
					const { date_submitted, id, status } = attempt;
					result.push({
						_id,
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
    try {
      const data = await workflowServices.get();
				if (data !== null) {
					setWorkflows(transformData(data));
					setLoading(false);
				}
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setLoading(false);
    }
  }, []);


	// Allows you to perform side effects like data fetching after the component renders.	
  useEffect(() => {
    if (!hasWkfData.current) {
      fetchWorkflows();
      hasWkfData.current = true; // mark as fetched
    }
    // set up the interval to update the log text
    wkfIntervalRef.current = setInterval(() => {
      fetchWorkflows();
    }, CHECK_WORKFLOWS);
    // clean up the interval on component unmount
    return () => {
      if (wkfIntervalRef.current) {
        clearInterval(wkfIntervalRef.current);
      }
    };
  }, [fetchWorkflows]);

  
	// This function will be passed down to refresh after deletion
	const handleRemoveComplete = () => {
		fetchWorkflows(); // Re-fetch after deletion
		setSelectedWorkflows(null); // Clear selected records
	};


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
      <div className="flex justify-content-between align-items-center">
        <div className="table-datasets-action">
					{ auth.role === 'admin'? (
						<RemoveRecordButton
							loading={loading}
							setLoading={setLoading}
							selectedWorkflows={selectedWorkflows}
							onRemoveComplete={handleRemoveComplete}
						/>
          ) : <></> }
        </div>
				<div className="table-workflows-search">
					<IconField iconPosition="left">
							<InputIcon className="pi pi-search" />
							<InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
					</IconField>
				</div>
			</div>
    );
  };

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
          header={renderHeader}
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




/**
 * StatusMessage
 * Create the status workflow in the table
 * @param {String} status
 * @returns 
 */
const StatusMessage = ({ status }) => {
  const severity = {
    'running': 'info',
    'completed': 'success',
    'failed': 'error',
  }[status];

  return ( <Message severity={severity} text={status} /> );
};




/**
 * ActionButton component
 * Create Action button for current workflow
 * @param {Object} data - Object of workflow
 * @param {Integer} attempt - Number of attempt
 * @returns 
 */
const ActionButton = ({ data, attempt }) => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/workflows/${data._id}/${attempt}/view`
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



/**
 * RemoveRecordButton Component
 * Button to remove selected workflow with confirmation dialog.
 */
const RemoveRecordButton = ({loading, setLoading, selectedWorkflows, onRemoveComplete}) => {
  // declare states
	const [displayDialog, setDisplayDialog] = useState(false);
  // handle the click to show confirmation dialog
  const handleRemove = () => {
		if (!selectedWorkflows || selectedWorkflows.length === 0) {
			showWarning('','Please select at least one dataset to remove.');
			return;
		}
		// show the confirmation dialog
		setDisplayDialog(true);
  };
	// render
	return (
	<>
		<Button
			icon="pi pi-minus"
			severity="danger"
			rounded
			raised
			onClick={handleRemove}
			disabled={loading || !selectedWorkflows || selectedWorkflows.length === 0}
		/>
		<ConfirmDialog
			displayDialog={displayDialog}			
			setDisplayDialog={setDisplayDialog}
			setLoading={setLoading}
			selectedWorkflows={selectedWorkflows}
			onRemoveComplete={onRemoveComplete}
		/>
	</>
	);
};




/**
 * ConfirmDialog Component
 * Displays confirmation dialog for workflow deletion.
 */
const ConfirmDialog = ({ displayDialog, setDisplayDialog, setLoading, selectedWorkflows, onRemoveComplete }) => {
  // open dialog
  const handleConfirm = async () => {
		setDisplayDialog(false); // Hide the dialog
		setLoading(true);
		try {
			// loop over the selected workflows and delete each one
			console.log( selectedWorkflows );
			for (let ds of selectedWorkflows) {
				await workflowServices.delete(ds._id);
				showInfo('',`The workflow '${ds.name}' was deleted correctly`)
			}
			// once complete, call the callback to refresh workflows
			onRemoveComplete();
		} catch (error) {
			console.error('Error removing workflows:', error);
			showError('','An error occurred while deleting the workflows.');
		} finally {
			setLoading(false);
		}
  };
  // close the dialog
  const handleCancel = () => {
    setDisplayDialog(false);
  };
  // render
  return (
    <Dialog header="Confirm Deletion" visible={displayDialog} onHide={handleCancel}>
      <div>
        <p>Are you sure you want to delete the selected workflows?</p>
      </div>
      <div className="flex justify-content-end">
        <Button label="No" onClick={handleCancel} className="p-button-text" />
        <Button label="Yes" onClick={handleConfirm} severity="danger" />
      </div>
    </Dialog>
  );
};




export default Workflows;
