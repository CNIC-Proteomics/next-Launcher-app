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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import { CHECK_WORKFLOWS, STATUS_SEVERITY, BACKEND_HOST_NAME } from '../constants';
import { showInfo, showError, showWarning } from '../services/toastServices';
import * as globalServices from '../services/globalServices';
import { userServices } from '../services/userServices';
import { workflowServices } from '../services/workflowServices';





/**
 * Workflows component
 * Create the workflow table
 * @returns 
 */
const Workflows = () => {
  
  // Declare auth context
	const { auth } = useContext(userServices);

  // State management
  const [selectedWorkflows, setSelectedWorkflows] = useState(null); // selected states (must be declared before any conditional return)
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
	// ref to track if data has been fetched
  const hasWkfData = useRef(false);
	const wkfIntervalRef = useRef(null);

  // Define header
  const columns = [
    ...(auth.role === 'admin'? [{ field: 'host_name', header: 'Host' }] : []), // include only for admin
    ...(auth.role === 'admin'? [{ field: 'author', header: 'Author' }] : []), // include only for admin
    { field: '_id', header: 'Id' },
    { field: 'name', header: 'Name' },
    { field: 'description', header: 'Description' },
    { field: 'attempt', header: 'Attempt' },
    { field: 'date_submitted', header: 'Date submitted' },
    { field: 'status', header: 'Status' },
    { field: 'action', header: 'Action' }
  ];


	// Get the workflows
	// with useCallback: Memorize the fetchWorkflows function
  const fetchWorkflows = useCallback(async () => {
		// transform and sort the data for the table
		const transformData = (data) => {
			let result = [];
			data.forEach(item => {
				const { host_name, _id, name, author, attempts } = item;
        // filter by BACKEND_HOST_NAME for non-admin users
        if (auth?.role !== 'admin' && host_name !== BACKEND_HOST_NAME) {
          return; // skip this workflow
        }
				attempts.forEach(attempt => {
					const { id, description, date_submitted, status } = attempt;
					result.push({
            host_name,
						_id,
						name,
						description,
						author,
						'date_submitted': globalServices.convertTimestampToDate(date_submitted),
						'attempt': id,
						status,
						'action': <ActionButton data={item} attempt={id} />
					});
				});
			});
      result = result.sort((a, b) => new Date(b.date_submitted) - new Date(a.date_submitted));
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
      showError('', 'Error fetching workflows');
    } finally {
      setLoading(false);
    }
  }, [auth]);

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

  return (
    <div className='table-workflows'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        <>
        <ConfirmDialog />
        <DataTable
          size='small'
          value={workflows}
          header={renderHeader}
          filters={filters}
          globalFilterFields={columns.map(c => c.field)}
          paginator rows={20} rowsPerPageOptions={[5, 10, 20, 50, 100]}
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
  return ( <Message severity={STATUS_SEVERITY[status]} text={status} /> );
};



/**
 * Cancel workflow functions
 * Functions to cancel selected workflow with confirmation dialog.
 */
const confirmCancel = (data) => {
  confirmDialog({
    message: `Are you sure you want to cancel "${data.name}" workflow?`,
    header: 'Confirm Cancellation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleCancelWorkflow(data)
  });
};
const handleCancelWorkflow = async (data) => {
  try {
    await workflowServices.cancel(data._id);
    showInfo('', `Workflow '${data.name}' has been canceled.`);
  } catch (error) {
    showError('', 'An error occurred while canceling the workflow.');
  }
};


/**
 * Re-Launch workflow functions
 * Functions to re-launch selected workflow with confirmation dialog.
 */
const confirmReLaunch = (data, attempt, history) => {
  let hasClose = false;
  let sms = `Are you sure you want to relaunch the "${data.name}" workflow?`
  if ( data.status === 'running' ) {
    hasClose = true;
    sms = (<>
      Are you sure you want to relaunch the "{data.name}" workflow?
      <br />
      First, the workflow <strong>will be canceled before relaunching</strong>.
    </>);
  }
  confirmDialog({
    message: sms,
    header: 'Confirm Re-Launch',
    icon: 'pi pi-exclamation-triangle',
    accept: () => handleReLaunchWorkflow(hasClose, data, attempt, history),
  });
};
const handleReLaunchWorkflow = async (hasClose, data, attempt, history) => {
  try {
    if ( hasClose ) {
      await handleCancelWorkflow(data); // wait for cancellation to complete
    }
    history.push({
      pathname: `/pipelines/${data.name}/update/${data._id}/${attempt}`
    });
  } catch (error) {
    showError('', 'An error occurred while relaunching the workflow.');
  }
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

  // Create splitButton menu
  const items = [
    {
        label: 'Stop',
        icon: 'pi pi-stop-circle',
        command: () => confirmCancel(data)
    },{
      label: 'Re-Launch',
      icon: 'pi pi-replay',
      command: () => confirmReLaunch(data, attempt, history)
    }
  ];
  const onView = () => {
    setNavigate(true);
  };
  return (
  <>
    <SplitButton label="View" icon="pi pi-eye" dropdownIcon="pi pi-ellipsis-v" onClick={onView} model={items} />
  </>);
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
		<ConfirmRemove
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
 * ConfirmRemove Component
 * Displays confirmation dialog for workflow deletion.
 */
const ConfirmRemove = ({ displayDialog, setDisplayDialog, setLoading, selectedWorkflows, onRemoveComplete }) => {
  // open dialog
  const handleConfirm = async () => {
		setDisplayDialog(false); // Hide the dialog
		setLoading(true);
		try {
			// loop over the selected workflows and delete each one
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
