/**
 * Dataset Page Component
 * This component displays and manages a dataset page. It handles data fetching, creation, updates, and user interactions.
 */

import React, { useState,  useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';

import { MAX_FILE_SIZE } from '../constants';
import { showInfo, showError, showWarning } from '../services/toastServices';
import * as globalServices from '../services/globalServices';
import { userServices } from '../services/userServices';
import { datasetServices } from '../services/datasetServices';
import Volumes from './Volumes';




const Dataset = (props) => {

	// Declare context
	const { auth } = useContext(userServices);


	// Capture inputs	
	// capture data from URL if no props are provided
	// prioritize props over route params
	const { id: routeId, operation: routeOperation } = useParams();	
	const id = props.id || routeId;
	const operation = props.operation || routeOperation;
	const selectDatasetFile = props.selectDatasetFile || undefined;


	// Declare states and references
	const [datasetId, setDatasetId] = useState(id);
	const [dataset, setDataset] = useState({name: '', description: '', files: []});
	const hasDatasetData = useRef(false); // reference to track if data has been fetched
	const [loading, setLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const history = useHistory();


	// Function to fetch dataset data based on datasetId (moved outside of useEffect)
	const fetchDataset = async (datasetId) => {
		try {
			const result = await datasetServices.get(datasetId);
			if (result && result.files) {
				// update the status of each file
				// if the file has children, recursively add the status to its children
				const addStatusToFiles = (files, parentStatus = null) => {
					return files.map(file => {
						// update the file's checked status
						file.data.checked = false;
						// determine current status based on parent
						if (parentStatus === 'link') {
							file.data.status = ''; // set empty status if parent is "link"
						} else {
							file.data.status = file.data.is_link ? 'link' : 'upload'; // default status (upload)
						}
						// process children recursively
						if (file.children) { file.children = addStatusToFiles(file.children, file.data.status) }
						return file;
					});
				};
				const updatedFiles = addStatusToFiles(result.files);
				// update state
				setDataset({...result, files: updatedFiles });
			}
			setLoading(false); // turn off spinner
		} catch (error) {
			setLoading(false);
			let e = 'The dataset was not obtained correctly'
			showError('', e);
			console.error(`${e}: ${error}`);
		}
	};


	// Updates the info of dataset state
	const updateDataset = (updates) => {
		setDataset((prevDataset) => ({
				...prevDataset, // preserve all existing properties
				...updates,     // overwrite properties with updates
		}));
	};


	// Create the dataset instace ---
	const createDataset = async () => {
		setIsProcessing(true);
		// create the dataset instance
		const id = await createData(dataset, auth);
		if (id) {
			// upload/link the files from file table
			if ( 'files' in dataset ) {
				await updateFiles(id, dataset.files);
			}
			setIsProcessing(false);
			showInfo('', 'The dataset was created correctly');
			// redirect to datasets
			history.push({
        pathname: `/datasets`
      });
		}
	};
  const createData = async (dataset, auth) => {
    // convert the data pipeline to POST
    let dataPOST = {};
    try {
      dataPOST = {
        author: auth.username,
				name: dataset.name,
        description: dataset.description
      };
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Processing the data for the POST request during dataset creation: ', error);
    }
    // call service
    try {
      if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
        const result = await datasetServices.create(dataPOST);
        if (result && result._id) {
          setDatasetId(result._id);
          return result._id;
				}
        else {  
          showError('', 'The dataset was not created correctly');
          console.error('The dataset was not created correctly.');
        }
      }
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Error: making a POST request during dataset creation: ', error);
    }
	};


	// Update the dataset ---
  const editDataset = async () => {
		setIsProcessing(true);
		// update the dataset info
		await updateData(datasetId, dataset);
		// update the files (add and remove)
		if ( 'files' in dataset ) {
			await updateFiles(datasetId, dataset.files);
		}
		// refetch dataset after operation
		fetchDataset(datasetId);
		setIsProcessing(false);
		showInfo('', 'The dataset was updated correctly');
		// redirect to datasets
		history.push({
			pathname: `/datasets`
		});
	};
	// Update the files (add and remove files)
	const updateData = async (id, dataset) => {
		// convert the data pipeline to POST
		let dataPOST = {};
		try {
			dataPOST = {
				name: dataset.name,
				description: dataset.description
			};
		} catch (error) {
			showError('', 'Processing the data for the POST request during dataset creation');
			console.error('Processing the data for the POST request during dataset creation: ', error);
		}
		// make the POST request to edit a dataset
		try {
			if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
				const result = await datasetServices.edit(id, dataPOST);
				if (!result) {
					showError('', 'The dataset was not updated correctly');
					console.error('The dataset was not updated correctly.');
				}
			}
		} catch (error) {
			showError('', 'Processing the data for the POST request during dataset update');
			console.error('Error: making a POST request during dataset update: ', error);
		}
	};


  // Update the files (add and remove files)
	const updateFiles = async (id, files) => {
		// function to recursively process each file and its children
		const processFile = async (file) => {
			// upload the given file
			if (file.data.status === 'uploadable') {
				try {
					// update status to uploading
					file.data.status = 'uploading';
					updateDataset({ 'files': files }); // update the files of dataset
					// upload logic based on file path
					if (file.data.type === 'file' && file?.data?.path) {
						if (file.data.path === '.') {
							await datasetServices.up(id, 'file-path', globalServices.getBaseName(file.data.name), file.data.object);
						} else if (file.data.path !== '.') {
							await datasetServices.up(id, 'directory-path', file.data.path, file.data.object);
						}
					}
					// update status to uploaded
					file.data.status = 'upload';
					updateDataset({ 'files': files }); // update the files of dataset
				} catch (error) {
					let e = `Failed to upload ${file.data.name}`;
					showError('', e);
					console.error(`${e} : ${error}`);
				}
			// link the given file
			} else if (file.data.status === 'linkable') {
				try {
					// update status to linking
					file.data.status = 'linking';
					updateDataset({ 'files': files }); // update the files of dataset
					// create symbolic link based on volume path
					await datasetServices.link(id, { 'path': file.key, 'name': file.data.name });
					// update status to uploaded
					file.data.status = 'link';
					updateDataset({ 'files': files }); // update the files of dataset
				} catch (error) {
					let e = `Failed to link ${file.data.name}`;
					showError('', e);
					console.error(`${e} : ${error}`);
				}
			// remove the given file
			} else if (file.data.status === 'deletable') {
				try {
					// update status to deleting
					file.data.status = 'deleting';
					updateDataset({ 'files': files }); // update the files of dataset
					// deletion logic based on file type (folder or file)
					if (file.data.type === 'file' && file?.data?.path) {
						await datasetServices.remove(id, { 'filenames': [`${file.data.path}/${file.data.name}`] });
					} else if (file.data.type === 'folder') {
						await datasetServices.remove(id, { 'filenames': [`${file.data.name}`] });
					}
					// update status to deleted
					file.data.status = 'deleted';
					updateDataset({ 'files': files }); // update the files of dataset
				} catch (error) {
					let e = `Failed to delete ${file.data.name}`;
					showError('', e);
					console.error(`${e} : ${error}`);
				}
			}
			// if the file has children, recursively process them
			if (file.children && file.children.length > 0) {
				for (const child of file.children) {
					await processFile(child); // recursively process each child
				}
			}
		};
		// iterate over all top-level files
		for (const file of files) {
			await processFile(file); // process each file (and its children)
		}
	};


	// Update the files (add and remove files)
	const selectDataset = () => {
		selectDatasetFile(dataset);
	};


  // Fetch dataset data based on datasetId
  useEffect(() => {
		// fetch dataset if not already fetched
		if (datasetId && !hasDatasetData.current) {
			fetchDataset(datasetId);
			hasDatasetData.current = true; // mark as fetched
		}
	}, [datasetId]);


	// Render
	return (
	<div className='report-dataset'>
		{loading ? (
			<div className="flex justify-content-center flex-wrap">
				<ProgressSpinner />
			</div>
		) : (
			operation === 'view' ? (
				<DatasetView dataset={dataset} updateDataset={updateDataset} operationDataset={selectDataset} isProcessing={isProcessing} />
			) : operation === 'create' ? (
				<DatasetCreate dataset={dataset} updateDataset={updateDataset} operationDataset={createDataset} isProcessing={isProcessing} />
			) : operation === 'update' ? (
				<DatasetUpdate dataset={dataset} updateDataset={updateDataset} operationDataset={editDataset} isProcessing={isProcessing} />
			) : <></>
		)}
	</div>
	);
};




/**
 * DatasetView Component
 * Displays the dataset details in view mode.
 */
const DatasetView = ({ dataset, updateDataset, operationDataset, isProcessing }) => {
	const name = dataset.name || '';
	const description = dataset.description || '';	
	return (
	<>
    <div className="card-dataset">
      <Card title={name}>
        <small className="m-0">{description}</small>
      </Card>
    </div>
		<DatasetFileViewer dataset={dataset} updateDataset={updateDataset} />
		<div className="field dataset-submit flex justify-content-center">
			<Button label="Select" onClick={() => operationDataset()} disabled={isProcessing} />
		</div>
	</>
	);
};




/**
 * DatasetCreate Component
 * Form for creating a new dataset, allowing users to input name, description, and files.
 */
const DatasetCreate = ({ dataset, updateDataset, operationDataset, isProcessing }) => {
	// Update states
	const onChangeName = (e) => {
		const newValue = e.target.value;
		updateDataset({ 'name': newValue }); // update the name of dataset
	};
	const onChangeDescription = (e) => {
		const newValue = e.target.value;
		updateDataset({ 'description': newValue }); // update the description of dataset
	};
	// Manage VolumeDialog
	const [isDialogVisible, setDialogVisible] = useState(false);
	const openVolumeDialog = () => setDialogVisible(true);
	const closeVolumeDialog = () => setDialogVisible(false);
	// Render
	return (
	<>
		<Panel header="Give a name for your dataset:">
			<div className={`field dataset-name`}>
				<InputText id={`input-text-dataset-name`} className='w-4' maxLength='50' value={dataset.name} onChange={onChangeName}/>
			</div>
		</Panel>
		<Panel header="Describe briefly your dataset:">
			<div className={`field dataset-description`}>
				<InputText id={`input-text-dataset-description`} className='w-full' maxLength='150' value={dataset.description} onChange={onChangeDescription}/>
			</div>
		</Panel>
		<Panel header="Add/Remove folder/files into your dataset:">
			<DatasetFileViewer dataset={dataset} updateDataset={updateDataset} hasHeader={true} openVolumeDialog={openVolumeDialog} />
		</Panel>
		<div className="field dataset-submit flex justify-content-center">
			<Button label="Create" onClick={() => operationDataset()} disabled={isProcessing} />
		</div>
		<VolumeDialog dialogVisible={isDialogVisible} hideDialog={closeVolumeDialog} dataset={dataset} updateDataset={updateDataset} />
	</>
	);
};




/**
 * DatasetUpdate Component
 * Form for updating an existing dataset.
 */
const DatasetUpdate = ({ dataset, updateDataset, operationDataset, isProcessing }) => {
	// Update states
	const onChangeName = (e) => {
		const newValue = e.target.value;
		updateDataset({ 'name': newValue }); // update the name of dataset
	};
	const onChangeDescription = (e) => {
		const newValue = e.target.value;
		updateDataset({ 'description': newValue }); // update the description of dataset
	};
	// Manage VolumeDialog
	const [isDialogVisible, setDialogVisible] = useState(false);
	const openVolumeDialog = () => setDialogVisible(true);
	const closeVolumeDialog = () => setDialogVisible(false);
	// Render
	return (
	<>
		<Panel header="Give a name for your dataset:">
			<div className={`field dataset-name`}>
				<InputText id={`input-text-dataset-name`} className='w-4' maxLength='50' value={dataset.name} onChange={onChangeName}/>
			</div>
		</Panel>
		<Panel header="Describe briefly your dataset:">
			<div className={`field dataset-description`}>
				<InputText id={`input-text-dataset-description`} className='w-full' maxLength='150' value={dataset.description} onChange={onChangeDescription}/>
			</div>
		</Panel>
		<Panel header="Add/Remove folder/files into your dataset:">
			<DatasetFileViewer dataset={dataset} updateDataset={updateDataset} hasHeader={true} openVolumeDialog={openVolumeDialog} />
		</Panel>
		<div className="field dataset-submit flex justify-content-center">
			<Button label="Update" onClick={() => operationDataset()} disabled={isProcessing} />
		</div>
		<VolumeDialog dialogVisible={isDialogVisible} hideDialog={closeVolumeDialog} dataset={dataset} updateDataset={updateDataset} />
	</>
	);
};




/**
 * DatasetFileViewer Component
 * Responsible for displaying and selecting files within the dataset.
 */
const DatasetFileViewer = ({ dataset, updateDataset, hasHeader, openVolumeDialog }) => {
	
	// Declare states
	const [key, setKey] = useState(	dataset.files && dataset.files.length > 0 ? parseInt(dataset.files[dataset.files.length - 1].key) : 0 );
	const [selectedKeys, setSelectedKeys] = useState({});
	const [expandedModuleKeys, setExpandedModuleKeys] = useState({});


	// Declare refs for file and folder input
	const fileInputRef = useRef(null);
	const folderInputRef = useRef(null);


	// Status template
	const StatusMessage = ({ status }) => {
		const severity = {
				uploadable: 'info',
				linkable: 'info',
				deletable: 'info',
				deleting: 'warning',
				uploading: 'warning',
				linking: 'warning',
				upload: 'success',
				link: 'success',
		}[status];

		return <Tag rounded value={status} severity={severity} />;
	};
	const statusBodyTemplate = (rowData) => {
		return rowData['data'].status ? <StatusMessage status={rowData['data'].status} /> : <></>;
	};


	// Function to handle adding a folder with files to the dataset
	const addFilesFolder = (addedFolder) => {
			if (addedFolder.length === 0) return;
			let folderName = addedFolder[0].webkitRelativePath.split('/')[0];
			let baseFolderName = folderName;
			let suffix = 0;
			const lastUnderscoreIndex = folderName.lastIndexOf('_');
			if (lastUnderscoreIndex !== -1 && !isNaN(folderName.slice(lastUnderscoreIndex + 1))) {
					baseFolderName = folderName.slice(0, lastUnderscoreIndex); // folder name until last underscore
					suffix = parseInt(folderName.slice(lastUnderscoreIndex + 1), 10); // extract numeric suffix
			}
			// const existingFolderNames = files.map((file) => file.data.name);
			const existingFolderNames = dataset.files.map((file) => file.data.name);
			while (existingFolderNames.includes(folderName)) {
					suffix += 1;
					folderName = `${baseFolderName}_${suffix}`; // ensure unique folder name
			}
			const nextKey = key + 1;
			setKey(nextKey);
			const folderNode = {
					key: `${nextKey}`,
					data: {
						name: folderName,
						type: 'folder',
						status: 'uploadable',
						checked: false,
						size: null
					},
					children: addedFolder.map((file, index) => ({
							key: `${nextKey}-${index}`,
							data: {
									name: file.name,
									type: 'file',
									status: 'uploadable',
									checked: false,
									size: globalServices.formatFileSize(file.size),
									path: folderName,
									object: file,
							},
					})),
			};
			const updatedFiles = [...dataset.files, folderNode];
			updateDataset({ 'files': updatedFiles });
	};


	// Function to add multiple files to the TreeTable
	const addMultipleFiles = (addedFiles) => {
		let currentKey = key;
		const fileNodes = addedFiles.map((file) => {
			currentKey += 1;
			return {
					key: `${currentKey}`,
					data: {
							name: file.name,
							type: 'file',
							size: globalServices.formatFileSize(file.size),
							status: 'uploadable',
							checked: false,
							path: '.',
							object: file,
					},
			};
		});
		setKey(currentKey);
		const updatedFiles = [...dataset.files, ...fileNodes];
		updateDataset({ 'files': updatedFiles });
	};


	// Remove selected files from the dataset
	const removeInputs = (selectedKeys) => {
		if (!selectedKeys || Object.keys(selectedKeys).length === 0) return;
		// use extractCheckedFiles to get the fully checked files
		const fullySelectedFiles = extractCheckedFiles(selectedKeys, dataset.files);
		// mark selected files as deletable
		const markFilesAsDeletable = (file) => {
			if (file?.data?.checked) {
				if (('status' in file.data && (file.data.status === 'upload' || file.data.status === 'link'))) {
					file.data.status = 'deletable';
				} else if (('status' in file.data && (file.data.status === 'uploadable' || file.data.status === 'linkable'))) {
					return null; // remove files with 'uploadable' and 'linkable' status
				}
			}
			if (file.children && file.children.length > 0) {
				file.children = file.children.map((child) => markFilesAsDeletable(child)).filter((child) => child !== null);
			}
			return file;
		};
		// mark all fully selected files as deletable
		let updatedFiles = fullySelectedFiles.map((file) => markFilesAsDeletable(file)).filter((file) => file !== null);
		// reorder keys after deleting files
		const reorderKeys = (files, parentKey = '') => {
				return files.map((file, index) => {
						if (!file) return null; // Make sure file is not null
						const newKey = parentKey === '' ? `${index}` : `${parentKey}-${index}`;
						file.key = newKey;
						if (file.children && file.children.length > 0) {
								file.children = reorderKeys(file.children, newKey);
						}
						return file;
				}).filter((file) => file !== null); // filter out any null files
		};
		// update states
		updatedFiles = reorderKeys(updatedFiles);
		updateDataset({ 'files': updatedFiles });
		setSelectedKeys({});
	};


	// Function to extract fully selected files
	const extractCheckedFiles = (selectedKeys, files) => {
		const fullyCheckedKeys = Object.keys(selectedKeys).filter((key) => selectedKeys[key].checked === true);
		// recursively labeled selected files (checked attr to true)
		const getCheckedFiles = (fileList) => {
			const selectedFiles = [];
			fileList.forEach((file) => {
				if (fullyCheckedKeys.includes(file.key)) {
					file.data.checked = true;
				} else {
					file.data.checked = false;
				}
				selectedFiles.push(file);
				if (file.children && file.children.length > 0) { getCheckedFiles(file.children); }
			});
			return selectedFiles;
		};
		// return checked files
		return getCheckedFiles(files);
	};

		
	// Filter files to exclude subfolders and check file size
	const controlFiles = (files) => {
			const auxFilteredFiles = files.filter((file) => {
					const relativePath = file.webkitRelativePath;
					return relativePath.split('/').length <= 2;
			});
			const filteredFiles = auxFilteredFiles.filter((file) => file.size <= MAX_FILE_SIZE);
			const largeFiles = auxFilteredFiles.filter((file) => file.size > MAX_FILE_SIZE).map((file) => file.name);
			if (largeFiles.length > 0) {
					showWarning('', `Some files are too large and were excluded:  ${largeFiles.join(', ')}`);
			}
			return filteredFiles;
	};

	const handleFileSelection = (event) => {
			const files = Array.from(event.target.files);
			addMultipleFiles(controlFiles(files));
	};
	const handleFolderSelection = (event) => {
			const files = Array.from(event.target.files);
			addFilesFolder(controlFiles(files));
	};

	const triggerFileSelection = () => {
			fileInputRef.current.click();
	};
	const triggerFolderSelection = () => {
			folderInputRef.current.click();
	};


	// Update the selected files based on the selection change
	const handleSelectionChange = (e) => {
		const selectedKeys = e.value;
		setSelectedKeys(selectedKeys); // update local selection state
		// update the dataset's checked attribute based on selection
		const updatedFiles = extractCheckedFiles(selectedKeys, dataset.files);
		updateDataset({ 'files': updatedFiles }); // update the parent component with the modified files
	};


	// Functions that freeze the elements opened in the file tree (viewer)
	const handleModuleExpand = (e) => {
		setExpandedModuleKeys(e.value);
	};


	// create header buttons
	const header = (
		hasHeader ? (
			<div className="header-button justify-content-start">
				<Button icon="pi pi-cloud-upload" rounded raised tooltip="Add files from volume(s)" tooltipOptions={{position:'left'}} onClick={openVolumeDialog} />
				<Button icon="pi pi-file-plus" rounded raised tooltip="Add file from local disk" tooltipOptions={{position:'top'}}  onClick={triggerFileSelection} />
				<input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileSelection} />
				<Button icon="pi pi-folder-plus" rounded raised tooltip="Add all files from local folder" tooltipOptions={{position:'top'}} onClick={triggerFolderSelection} />
				<input ref={folderInputRef} type="file" webkitdirectory="true" style={{ display: 'none' }} onChange={handleFolderSelection} />
				<Button icon="pi pi-minus" severity="danger" rounded raised tooltip="Remove files" tooltipOptions={{position:'top'}} onClick={() => removeInputs(selectedKeys)} />				
			</div>
			) : <></>
	);

	return (
	<div className="field file-viewer">
		<TreeTable
			selectionMode="checkbox"
			scrollable
			value={dataset.files}
			header={header}
			selectionKeys={selectedKeys}
			onSelectionChange={handleSelectionChange}
			tableStyle={{ minWidth: '50rem' }}
			expandedKeys={expandedModuleKeys}
			onToggle={handleModuleExpand}
		>
			<Column field="name" header="Name" expander />
			<Column field="size" header="Size" className="short-column" />
			<Column field="type" header="Type" className="short-column" />
			<Column field="status" header="Status" className="short-column" body={statusBodyTemplate} />
		</TreeTable>
	</div>
	);
};



/**
 * DatasetExplorerDialog
 * Creates dialog with the Dataset Explorer.
 */
const VolumeDialog = ({ dialogVisible, hideDialog, dataset, updateDataset }) => {

	// dialog with dynamic content
	return (
		<Dialog 
			header="Select folder/files from volumes"
			visible={dialogVisible} 
			style={{ width: 'calc(100vw - 100px)', height: 'calc(100vw - 100px)' }} // full-window dialog with 50px margin on each side
			onHide={hideDialog}
			modal
		>
			<Volumes hideDialog={hideDialog} dataset={dataset} updateDataset={updateDataset} />
		</Dialog>
  );
};


export default Dataset;