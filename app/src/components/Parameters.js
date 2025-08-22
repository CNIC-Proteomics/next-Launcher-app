/*
 * Import libraries
 */

import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from "primereact/inputswitch";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';

import { showError } from '../services/toastServices';
import Datasets from './Datasets';
import Dataset from './Dataset';
  


/*
 * Components
 */



/**
 * DescriptionParameter
 * Creates description pipeline.
 */
export const DescriptionParameter = ({ title, postData, defaultValue }) => {

	// Declare state
	const [value, setValue] = useState(defaultValue || ''); // ensure default empty string

	// Update state when defaultValue changes
	useEffect(() => {
		if (defaultValue) {
			const newValue = defaultValue || '';
			setValue(newValue);
			// postData is updated if a default value exists
			postData['Description'] = { description: newValue };
		}
	}, [defaultValue, postData]);

	// Function to handle the change event
	const onChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		// save the POST data for parent component
		postData['Description'] = {
			'description': newValue,
		};
	};

	return (
		<div className="field">
			<label htmlFor="workflow-description">Describe briefly the execution of your <strong>{title}</strong> pipeline:</label>
			<InputText id="workflow-description" className="w-full" maxLength='138' value={value} onChange={onChange}/>
		</div>
	);
};




/**
 * DatasetExplorerDialog
 * Creates dialog with the Dataset Explorer.
 */
export const DatasetExplorerDialog = ({ pName, property, postData, defaultValue }) => {
	

	// Declare states
	const [dialogVisible, setDialogVisible] = useState(false);
	const [view, setView] = useState('table'); // 'table' or 'report'
	const [selectedDataset, setSelectedDataset] = useState(null);
	const [datasetValue, setDatasetValue] = useState(defaultValue || ''); // ensure default empty string


	// Update state and postData when defaultValue changes
	useEffect(() => {
		if ( defaultValue ) {
			const newValue = defaultValue || '';
			setDatasetValue(newValue);
			// postData is updated if a default value exists
			postData[property.title] = {
				name: `--${pName}`,
				type: property.format,
				value: newValue,
			};	
		}
	}, [defaultValue, pName, postData, property.format, property.title]);



	// Open the dialog
	const onDialog = () => {
		setDialogVisible(true);
	};


	// Close the dialog
	const hideDialog = () => {
		setDialogVisible(false);
		setView('table'); // reset to table view when dialog is closed
	};


	// Handler to switch to dataset view when "Open" is clicked
	const setDatasetForDialog = (dataset) => {
		setSelectedDataset(dataset);
		setView('report');
	};


	// Handler to switch to dataset view when "Open" is clicked
	const selectDatasetFile = (dataset) => {

		// Recursive function to collect all files, including those in children
		const getAllFiles = (files) => {
			let allFiles = [];
			files.forEach(file => {
				if (file.data.type === 'file') { allFiles.push(file); }
				if (file.children && file.children.length > 0) { allFiles = allFiles.concat(getAllFiles(file.children)); }
			});
			return allFiles;
		};

		let selectedFileOrFolder = null;
		// Check if property.type is either 'file-path' or 'folder-path'
		if (property.format === 'file-path') {
			// flatten the file structure and find all checked files
			const allFiles = getAllFiles(dataset.files);
			const checkedFiles = allFiles.filter(file => file.data.checked === true);
			if (checkedFiles.length === 1) {
				let { path, name } = checkedFiles[0].data;
				selectedFileOrFolder = `${dataset._id}/${path === '.' ? '' : path + '/'}${name}`;
			} else {
				showError('','There must be exactly one checked file.');
			}
		} else if (property.format === 'directory-path') {
			// find the checked folder from dataset.files. Make sure we are looking at folders. Only checked folders
			const checkedFolders = dataset.files.filter(file => file.data.type === 'folder').filter(file => file.data.checked === true);
			if (checkedFolders.length === 1) {
				let name = checkedFolders[0].data.name;
				selectedFileOrFolder = `${dataset._id}/${name}/*`;
			} else {
				showError('','There must be exactly one checked folder.');
			}
		}
		if (selectedFileOrFolder) {
			const newValue = selectedFileOrFolder;
			setDatasetValue(newValue);
			// update the postData with the new value
			postData[property.title] = {
				'name': `--${pName}`,
				'type': property.format,
				'value': newValue,
			};
		}
		// close the dialog
		hideDialog();
	};


	// Breadcrumb items for navigation
	const breadcrumbItems = [
		{ label: 'Datasets', command: () => setView('table') }, // back to table view
		{ label: selectedDataset ? selectedDataset.name : 'Dataset' } // current dataset name
	];


	// Handler to update datasetValue from InputText
	const handleInputChange = (e) => {
		const newValue = e.target.value;
		setDatasetValue(newValue);
		// update the postData with the new value
		postData[property.title] = {
			'name': `--${pName}`,
			'type': property.format,
			'value': newValue,
		};
	};

	// Render
	return (
		<div className="flex flex-column gap-2">
			<label>{property.description}</label>
			<div className="single-file-dataset p-inputgroup flex">
				<InputText value={datasetValue} onChange={handleInputChange} />
				<Button 
					label="Browse" 
					icon="pi pi-cloud-upload" 
					className='border-round-right-md p-button-success' 
					onClick={onDialog} 
					outlined 
				/>
			</div>
			{/* <small id={`${property.title}-help`}>{property.help_text}</small> */}
			{/* dialog with dynamic content */}
			<Dialog 
				header={`Select: ${property.title}`}
				visible={dialogVisible} 
				style={{ width: 'calc(100vw - 100px)', height: 'calc(100vw - 100px)' }} // full-window dialog with 50px margin on each side
				onHide={hideDialog}
				modal
			>
				{/* render Breadcrumb and view-based content */}
				{view === 'table' && <Datasets setDatasetForDialog={setDatasetForDialog} />}
				{view === 'report' && (
					<>
						<BreadCrumb model={breadcrumbItems} />
						<Dataset id={selectedDataset._id} operation='view' selectDatasetFile={selectDatasetFile} /> {/* pass View Operation */}
					</>
				)}
		</Dialog>
		</div>
	);

};




/**
 * StringParameter
 * Creates a section for the type parameter, string.
 */
export const StringParameter = ({ pName, property, postData }) => {
	const [value, setValue] = useState(property.default || '');

	// Initialize postData only once when the component mounts
	useEffect(() => {
		postData[property.title] = {
			'name': `--${pName}`,
			'type': property.format,
			'value': value, // initialize with default value
		};
	}, [pName, property, value, postData]);

	// Function to handle the change event
	const onChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		postData[property.title] = {
			'name': `--${pName}`,
			'type': property.format,
			'value': newValue,
		};
	};

	// Render
	return (
		<div className="flex flex-column gap-2">
			<label>{property.description}</label>
			<div className='string-dataset p-inputgroup flex'>
				<InputText
					id={property.title}
					aria-describedby={`${property.title}-help`}
					value={value}
					onChange={onChange}
				/>
			</div>
			{/* <small id={`${property.title}-help`}>{property.help_text}</small> */}
		</div>
	);
};





/**
 * BooleanParameter
 * Creates a section for the type parameter, boolean.
 */
export const BooleanParameter = ({ pName, property, postData }) => {
	const [value, setValue] = useState(property.default || false);

	// Initialize postData only once when the component mounts
	useEffect(() => {
		postData[property.title] = {
			'name': `--${pName}`,
			'type': property.format,
			'value': String(value), // initialize with default value
		};
	}, [pName, property, value, postData]);

	// Function to handle the change event
	const onChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		postData[property.title] = {
			'name': `--${pName}`,
			'type': property.format,
			'value': String(newValue),
		};
	};

	return (
		<div className="flex flex-column gap-2">
			<label>{property.description}</label>
			<div className='boolean-dataset p-inputgroup flex'>
				<InputSwitch
					id={property.title}
					aria-describedby={`${property.title}-help`}
					checked={value}
					onChange={onChange}
				/>
			</div>
			{/* <small id={`${property.title}-help`}>{property.help_text}</small> */}
		</div>
	);
};

