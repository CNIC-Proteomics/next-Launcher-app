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
import { ProgressSpinner } from 'primereact/progressspinner';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

import { showInfo, showError, showWarning } from '../services/toastServices';
import * as globalServices from '../services/globalServices';
import { userServices } from '../services/userServices';


/**
 * Users component
 * Displays a table of all users (admin only)
 */
const Users = () => {
  // Declare auth context
  const { auth, query, remove } = useContext(userServices);

  // State management
  const [selectedUsers, setSelectedUsers] = useState(null); // selected states (must be declared before any conditional return)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // ref to track if data has been fetched
  const hasUserData = useRef(false);

  // Define header
  const columns = [
    { field: '_id', header: 'Id' },
    { field: 'username', header: 'Username' },
    { field: 'role', header: 'Role' },
    { field: 'date_created', header: 'Created At' },
    { field: 'action', header: 'Action' }
  ];


  // Get the users
  // with useCallback: Memorize the fetchUsers function
  const fetchUsers = useCallback(async () => {
    
    try {
      const data = await query();
      if (data) {
        const transformed = data.map((u) => ({
          ...u,
          date_created: globalServices.convertTimestampToDate(u.date_created),
          'action': <ActionButton data={u} />
        }));
        setUsers(transformed);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('', 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!hasUserData.current) {
      fetchUsers();
      hasUserData.current = true;
    }
  }, [fetchUsers]);

	// This function will be passed down to refresh after deletion
	const handleRemoveComplete = () => {
		fetchUsers(); // Re-fetch after deletion
		setSelectedUsers(null); // Clear selected records
	};


  // Develop the search filter in the datatable
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };


  // Header
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <div className="table-datasets-action">
            <AddRecordButton
              loading={loading}
              setLoading={setLoading}
              selectedUsers={selectedUsers}
              onRemoveComplete={handleRemoveComplete}
            />
            <RemoveRecordButton
              loading={loading}
              setLoading={setLoading}
              selectedUsers={selectedUsers}
              onRemoveComplete={handleRemoveComplete}
              remove={remove}
            />
        </div>
        <div className="table-users-search">
          <IconField iconPosition="left">
            <InputIcon className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
          </IconField>
        </div>
      </div>
    );
  };

  // Admin check rendering AFTER hooks
  if (auth.role !== 'admin') {
    return (
      <div className="flex justify-content-center flex-wrap">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className='table-users'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        <>
        <ConfirmDialog />
        <DataTable
          size='small'
          value={users}
          header={renderHeader}
          filters={filters}
          globalFilterFields={columns.map(c => c.field)}
          paginator rows={20} rowsPerPageOptions={[5, 10, 20, 50, 100]}
          selectionMode={'checkbox'} selection={selectedUsers} onSelectionChange={(e) => setSelectedUsers(e.value)}>
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>          
          {columns.map((col, i) => (
            <Column
              sortable
              key={i}
              field={col.field}
              header={col.header} />
          ))}
        </DataTable>
        </>
      )}
    </div>
  );
};




/**
 * ActionButton component
 * Create Action button for current workflow
 * @param {Object} data - Object of workflow
 * @param {Integer} attempt - Number of attempt
 * @returns 
 */
const ActionButton = ({ data }) => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/users/${data.username}/update`
      });
    }
  }, [navigate, history, data]);

  const onView = () => {
    setNavigate(true);
  };
  return (
  <>
    <Button label="Edit" icon="pi pi-user-edit" onClick={onView} />
  </>);
};



/**
 * AddRecordButton component
 * Create Action button for current workflow
 * @param {Object} data - Object of workflow
 * @param {Integer} attempt - Number of attempt
 * @returns 
 */
const AddRecordButton = ({ data }) => {

  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/register`
      });
    }
  }, [navigate, history, data]);

  const onAdd = () => {
    setNavigate(true);
  };
  return (
    <Button
			icon="pi pi-plus"
			rounded
			raised
			onClick={onAdd}
    />
  );
};


/**
 * RemoveRecordButton Component
 * Button to remove selected workflow with confirmation dialog.
 */
const RemoveRecordButton = ({loading, setLoading, selectedUsers, onRemoveComplete, remove}) => {
  // declare states
	const [displayDialog, setDisplayDialog] = useState(false);
  // handle the click to show confirmation dialog
  const handleRemove = () => {
		if (!selectedUsers || selectedUsers.length === 0) {
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
			disabled={loading || !selectedUsers || selectedUsers.length === 0}
		/>
		<ConfirmRemove
			displayDialog={displayDialog}			
			setDisplayDialog={setDisplayDialog}
			setLoading={setLoading}
			selectedUsers={selectedUsers}
			onRemoveComplete={onRemoveComplete}
      remove={remove}
		/>
	</>
	);
};




/**
 * ConfirmRemove Component
 * Displays confirmation dialog for workflow deletion.
 */
const ConfirmRemove = ({ displayDialog, setDisplayDialog, setLoading, selectedUsers, onRemoveComplete, remove }) => {
  // open dialog
  const handleConfirm = async () => {
		setDisplayDialog(false); // Hide the dialog
		setLoading(true);
		try {
			// loop over the selected workflows and delete each one
			for (let ds of selectedUsers) {
				await remove(ds.username);
				showInfo('',`The user '${ds.username}' was deleted correctly`)
			}
			// once complete, call the callback to refresh workflows
			onRemoveComplete();
		} catch (error) {
			console.error('Error removing users:', error);
			showError('','An error occurred while deleting the users.');
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
        <p>Are you sure you want to delete the selected users?</p>
      </div>
      <div className="flex justify-content-end">
        <Button label="No" onClick={handleCancel} className="p-button-text" />
        <Button label="Yes" onClick={handleConfirm} severity="danger" />
      </div>
    </Dialog>
  );
};




export default Users;
