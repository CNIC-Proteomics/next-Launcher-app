/**
 * Datasets Component
 * Main component for rendering datasets with options to search, upload, and remove datasets.
 */

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';

import { showInfo, showError, showWarning } from '../services/toastServices';
import { userServices } from '../services/userServices';
import { datasetServices } from '../services/datasetServices';







/**
 * Datasets Component
 * Main component for rendering datasets with options to search, upload, and remove datasets.
 * @param {function} setDatasetForDialog - Optional function to set the dataset in a dialog.
 */
const Datasets = ({ setDatasetForDialog  }) => {
  
  // Declare context
	const { auth } = useContext(userServices);


  // Define header
  const columns = [
    { field: 'name', header: 'Name' },
		{ field: 'description', header: 'Description' },
    { field: 'author', header: 'Author' },
    { field: 'date_created', header: 'Date created' },
    { field: 'n_files', header: 'Num. files' },
    { field: 'action', header: 'Action' }
  ];


  // Transform timestamp to formatted date and time string.
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


  // Declare states
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState(null);
  // ref to track if data has been fetched
  const hasWkfData = useRef(false);


	// Get the datasets calling the service
	// with useCallback: Memoize the fetchWorkflows function
  const fetchDatasets = useCallback(async () => {
    // transform raw dataset data to displayable format for the DataTable.
    // adds action buttons for each dataset.
    const transformData = (data) => {
      let result = [];
      data.forEach(item => {
        const { _id, name, description, author, date_created, n_files } = item;
        result.push({
          _id,
          name,
          description,
          author,
          'date_created': timestampToDate(date_created),
          'n_files': n_files,
          'action': <ActionButton data={item} setDatasetForDialog={setDatasetForDialog} />
        });
      });
      return result;
    };

		try {
      const data = await datasetServices.get();
      if ( data !== null ) {
        setDatasets(transformData(data));
        setLoading(false);	
      }
		} catch (error) {
      console.error('Error fetching datasets:', error);
      setLoading(false);
		}
  }, [setDatasetForDialog]);


  // This function will be passed down to refresh datasets after deletion
  const handleRemoveComplete = () => {
    fetchDatasets(); // Re-fetch datasets after deletion
    setSelectedDatasets(null); // Clear selected datasets
  };


	// Allows you to perform side effects like data fetching after the component renders.	
  useEffect(() => {
    if (!hasWkfData.current) {
      fetchDatasets();
      hasWkfData.current = true; // mark as fetched
    }
  }, [fetchDatasets]);


  // Develop the search filter in the datatable
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  // handle the change in global search filter.
  // updates the filter state for searching datasets by keyword.
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };


  // Render the header for the DataTable, including search input and action button
  const renderHeader = () => {
    return (
      <>
      <div className="flex justify-content-between align-items-center">
        <div className="table-datasets-action">
          { !setDatasetForDialog ? (
            <>
            <CreateRecordButton />
              { auth.role === 'admin' && (
                <RemoveRecordButton
                  loading={loading}
                  setLoading={setLoading}
                  selectedDatasets={selectedDatasets}
                  onRemoveComplete={handleRemoveComplete}
                />
              )}
            </>
          ) : <></> }
        </div>
        <div className="table-datasets-search">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
        </IconField>
        </div>
      </div>
      </>
    );
  };


  // render
  return (
    <div className='table-datasets'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        <>
        <DataTable
          size='small'
          value={datasets}
          header={renderHeader()}
          filters={filters}
          globalFilterFields={columns.map(c => c.field)}
          paginator rows={20} rowsPerPageOptions={[5, 10, 20]}
					selectionMode={auth.role === 'admin' ? "checkbox" : null}
					selection={selectedDatasets}
					onSelectionChange={(e) => setSelectedDatasets(e.value)}
				>
					{auth.role === 'admin' && (
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          )}
          {columns.map((col, i) => (
              <Column
                sortable
                key={i}
                field={col.field}
                header={col.header}
              />
          ))}
        </DataTable>
        </>
      )}
  </div>
  );

};




/**
 * CreateRecordButton Component
 * Button to navigate to the dataset creation page.
 */
const CreateRecordButton = () => {
  const [navigate, setNavigate] = useState(false);
  const history = useHistory();
  // effect to handle navigation when button is clicked
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/datasets/0/create`
      });
    }
  }, [navigate, history]);
  // click handler to trigger navigation
  const onClick = () => {
      setNavigate(true);

  };
  return ( <Button icon="pi pi-plus" rounded raised onClick={onClick} /> );
};




/**
 * RemoveRecordButton Component
 * Button to remove selected datasets with confirmation dialog.
 */
const RemoveRecordButton = ({loading, setLoading, selectedDatasets, onRemoveComplete}) => {
  // declare states
	const [displayDialog, setDisplayDialog] = useState(false);
  // handle the click to show confirmation dialog
  const handleRemove = () => {
		if (!selectedDatasets || selectedDatasets.length === 0) {
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
			disabled={loading || !selectedDatasets || selectedDatasets.length === 0}
		/>
		<ConfirmDialog
			displayDialog={displayDialog}			
			setDisplayDialog={setDisplayDialog}
			setLoading={setLoading}
			selectedDatasets={selectedDatasets}
			onRemoveComplete={onRemoveComplete}
		/>
	</>
	);
};




/**
 * ConfirmDialog Component
 * Displays confirmation dialog for dataset deletion.
 */
const ConfirmDialog = ({ displayDialog, setDisplayDialog, setLoading, selectedDatasets, onRemoveComplete }) => {
  // open dialog
  const handleConfirm = async () => {
		setDisplayDialog(false); // Hide the dialog
		setLoading(true);
		try {
			// loop over the selected datasets and delete each one
			for (let ds of selectedDatasets) {
				await datasetServices.delete(ds._id);
				showInfo('',`The dataset '${ds.name}' was deleted correctly`)
			}
			// once complete, call the callback to refresh datasets
			onRemoveComplete();
		} catch (error) {
			console.error('Error removing datasets:', error);
			showError('','An error occurred while deleting the datasets.');
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
        <p>Are you sure you want to delete the selected datasets?</p>
      </div>
      <div className="flex justify-content-end">
        <Button label="No" onClick={handleCancel} className="p-button-text" />
        <Button label="Yes" onClick={handleConfirm} severity="danger" />
      </div>
    </Dialog>
  );
};




/**
 * ActionButton Component
 * Button to open a specific dataset for viewing or editing.
 */
const ActionButton = ({ data, setDatasetForDialog }) => {
  // declare states
  const [navigate, setNavigate] = useState(false);
  const history = useHistory();
  // navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/datasets/${data._id}/update`
      });
    }
  }, [navigate, history, data]);
  // render the "ActionButton" if "setDatasetForDialog" is provided
  const onClick = () => {   
    // trigger the dataset view in the parent component (for Dialog)   
    if (setDatasetForDialog) {
      setDatasetForDialog(data);
    // navigate to the dataset view route (for Route)
    } else {
      setNavigate(true);
    }
  };
  return ( <Button label="Open" icon="pi pi-caret-right" onClick={onClick} /> );
};


export default Datasets;
