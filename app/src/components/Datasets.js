/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
	useContext
} from 'react';
import {
  useHistory
} from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';


import {
  showError,
	showInfo,
	showWarning
} from '../services/toastServices';

import { userServices } from '../services/userServices';
import { datasetServices } from '../services/datasetServices';




/*
 * Components
 */


// Function that transform the pipeline data
const Datasets = () => {
  
  // Declare context
	const { auth } = useContext(userServices);
  const history = useHistory();
  // Declare states
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState(null);
  // Define header
  const columns = [
    { field: 'name', header: 'Name' },
		{ field: 'description', header: 'Description' },
    { field: 'author', header: 'Author' },
    { field: 'date_created', header: 'Date created' },
    { field: 'n_files', header: 'Num. files' },
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

	// Transform the data for the table
	const transformData = (data) => {
		let result = [];
		data.forEach(item => {
			const { _id, name, description, author, date_created, n_files } = item;
			result.push({
				'id': _id,
				name,
				description,
				author,
				'date_created': timestampToDate(date_created),
				'n_files': n_files,
				'action': <ActionButton data={item} />
			});
		});
		return result;
	};

	// Get the datasets calling the service
	const fetchDatasets = async () => {
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
	};
 
  // Develop the search filter in the datatable
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // This function will be passed down to refresh datasets after deletion
  const handleRemoveComplete = () => {
    fetchDatasets(); // Re-fetch datasets after deletion
    setSelectedDatasets(null); // Clear selected datasets
  };

  // Header
  const renderHeader = () => {
    return (
      <>
      <div className="flex justify-content-between align-items-center">
				<div className="table-datasets-action">
					<CreateDatasetButton />
          { auth.role === 'admin' && (
						<RemoveDatasetButton
							loading={loading}
							setLoading={setLoading}
							selectedDatasets={selectedDatasets}
							onRemoveComplete={handleRemoveComplete}
						/>
					)}
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

	// useEffect hook allows you to perform side effects like data fetching after the component renders.	
  useEffect(() => {
		fetchDatasets();
  }, [history]);

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

const CreateDatasetButton = () => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);
	

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/datasets/0/create`
      });
    }
  }, [navigate, history]);

  const onClick = () => {
      setNavigate(true);

  };
  return ( <Button icon="pi pi-plus" rounded raised onClick={onClick} /> );
};


const RemoveDatasetButton = ({loading, setLoading, selectedDatasets, onRemoveComplete}) => {

	const [displayDialog, setDisplayDialog] = useState(false);

  // const handleRemove = async () => {
  //   if (!selectedDatasets || selectedDatasets.length === 0) {
  //     showWarning('','Please select at least one dataset to remove.');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     // Loop over the selected datasets and delete each one
  //     for (let ds of selectedDatasets) {
  //       await datasetServices.delete(ds.id); // Assuming `_id` is the unique identifier
	// 			showInfo('',`The dataset '${ds.description}' was deleted correctly`)
  //     }
  //     // Once complete, call the callback to refresh datasets
  //     onRemoveComplete();
  //   } catch (error) {
  //     console.error('Error removing datasets:', error);
  //     showError('','An error occurred while deleting the datasets.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRemove = () => {
		if (!selectedDatasets || selectedDatasets.length === 0) {
			showWarning('','Please select at least one dataset to remove.');
			return;
		}
		// Show the confirmation dialog
		setDisplayDialog(true);
  };

	// Render
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

const ConfirmDialog = ({ displayDialog, setDisplayDialog, setLoading, selectedDatasets, onRemoveComplete }) => {
  const handleConfirm = async () => {
    // setDisplayDialog(false); // Hide the dialog
    // try {
    //   for (const dataset of selectedDatasets) {
    //     await datasetServices.delete(dataset._id); // Perform deletion
    //   }
    //   onRemoveComplete(); // Refresh datasets after deletion
    // } catch (error) {
    //   console.error('Error removing datasets:', error);
    //   alert('An error occurred while deleting the datasets.');
    // }
		setDisplayDialog(false); // Hide the dialog
		setLoading(true);
		try {
			// Loop over the selected datasets and delete each one
			for (let ds of selectedDatasets) {
				await datasetServices.delete(ds.id); // Assuming `_id` is the unique identifier
				showInfo('',`The dataset '${ds.description}' was deleted correctly`)
			}
			// Once complete, call the callback to refresh datasets
			onRemoveComplete();
		} catch (error) {
			console.error('Error removing datasets:', error);
			showError('','An error occurred while deleting the datasets.');
		} finally {
			setLoading(false);
		}

  };

  const handleCancel = () => {
    setDisplayDialog(false); // Close the dialog
  };

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


const ActionButton = ({ data }) => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/datasets/${data._id}/update`
      });
    }
  }, [navigate, history, data]);

  const onClick = () => {
      setNavigate(true);

  };
  return ( <Button label="Open" icon="pi pi-caret-right" onClick={onClick} /> );
};


export default Datasets;
