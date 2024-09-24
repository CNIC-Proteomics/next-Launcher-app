/**
 * Dataset Page Component
 * Displays the dataset page, handles fetching, updating dataset data, and user interactions
 */


/**
 * Import libraries
 */

import React, {
  useState,
  useEffect,
	useContext,
	useRef,
} from 'react';
import {
  useParams,
} from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
// import { ProgressBar } from 'primereact/progressbar';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';

import { MAX_FILE_SIZE } from '../constants';
import {
	showInfo,
  showError,
	showWarning
} from '../services/toastServices';
import * as globalServices from '../services/globalServices';
import { userServices } from '../services/userServices';
import { datasetServices } from '../services/datasetServices';



const Dataset = () => {
	// declare context
	const { auth } = useContext(userServices);

	// capture data from URL
	const { id, operation } = useParams();
	
	// declare states
	const [loading, setLoading] = useState(true);
	const [datasetId, setDatasetId] = useState(id);
	const [dataset, setDataset] = useState({});
	// const [progress, setProgress] = useState(0);

	// declare references
	const hasDatasetData = useRef(false); // reference to track if data has been fetched
	

	// function to fetch dataset data based on datasetId (moved outside of useEffect)
	const getDatasetData = async (datasetId) => {
		try {
			const result = await datasetServices.get(datasetId);
			if (result && result.files) {
				// update the status of each file
				// if the file has children, recursively add the status to its children
				const addStatusToFiles = (files) => {
					return files.map(file => {
						if (file.data.type !== "folder") { file.data.status = "upload"; }
						if (file.children) { file.children = addStatusToFiles(file.children) }
						return file;
					});
				};
				const updatedFiles = addStatusToFiles(result.files);
				// update state
				setDataset({...result, files: updatedFiles });
				// updateDatasetFiles(updatedFiles); // notify parent of changes ??
			}
			setLoading(false); // turn off spinner
		} catch (error) {
			setLoading(false);
			let e = 'The dataset was not obtained correctly'
			showError('', e);
			console.error(`${e}: ${error}`);
		}
	};

  // fetch dataset data based on datasetId
  useEffect(() => {
		// // make the GET request to get the log
		// const getDatasetData = async (datasetId) => {
		// 	try {
		// 		const result = await datasetServices.get(datasetId);
		// 		if (result && result.files) {
		// 			// update the status of each file
		// 			// if the file has children, recursively add the status to its children
		// 			const addStatusToFiles = (files) => {
		// 				return files.map(file => {
		// 					if (file.data.type !== "folder") { file.data.status = "upload"; }
		// 					if (file.children) { file.children = addStatusToFiles(file.children) }
		// 					return file;
		// 				});
		// 			};
		// 			const updatedFiles = addStatusToFiles(result.files);
		// 			// update state
		// 			setDataset({...result, files: updatedFiles });
		// 		}
		// 		setLoading(false); // turn off spinner
		// 	} catch (error) {
		// 		setLoading(false);
		// 		let e = 'The dataset was not obtained correctly'
		// 		showError('', e);
		// 		console.error(`${e}: ${error}`);
		// 	}
		// };
		// fetch dataset if not already fetched
		if (datasetId && !hasDatasetData.current) {
			getDatasetData(datasetId);
			hasDatasetData.current = true; // mark as fetched
		}
	}, [datasetId]);


  // Updates the files within the dataset state
	const updateDatasetFiles = (updatedFiles) => {
		setDataset((prevDataset) => ({
		...prevDataset,
		files: updatedFiles,
		}));
	};


  // Updates the progress state (used in upload progress bar)
	const updateProgress = (updatedProgress) => {
		// setProgress(updatedProgress);
	};


	// Render
	return (
		<div className='report-dataset'>
		{loading ? (
			<div className="flex justify-content-center flex-wrap">
				<ProgressSpinner />
			</div>
		) : (
		<>
			<DatasetMetaData
				dataset={dataset}
			/>
			<DatasetViewer
				dataset={dataset}
				updateDatasetFiles={updateDatasetFiles}
			/>
			<DatasetOperation
				auth={auth}
				id={datasetId}
				dataset={dataset}
				operation={operation}
				setDatasetId={setDatasetId}
				updateDatasetFiles={updateDatasetFiles}
				updateProgress={updateProgress}
				refreshDataset={() => getDatasetData(datasetId)}
			/>
		</>
		)}
		</div>
	);
};




/**
 * DatasetMetaData Component
 * Allows users to edit the dataset's name and description
 */
const DatasetMetaData = ({dataset}) => {

	// declare states
	const [name, setName] = useState(dataset.name || '');
	const [description, setDescription] = useState(dataset.description || '');

	// update states
	const onChangeName = (e) => {
		const newValue = e.target.value;
		setName(newValue);
		dataset.name = newValue; // update dataset name
	};
	const onChangeDescription = (e) => {
		const newValue = e.target.value;
		setDescription(newValue);
		dataset.description = newValue; // update dataset description
	};

	// Render
	return (
	<>
		<Panel header="Give a name for your dataset:">
			<InputTextParameter name="dataset-name" value={name} onChange={onChangeName} />
		</Panel>
		<Panel header="Describe briefly your dataset:">
			<InputTextParameter name="dataset-description" value={description} onChange={onChangeDescription} />
		</Panel>
	</>
	);
};


/**
 * DatasetViewer Component
 * Displays dataset files in a TreeTable and allows adding/removing files
 */
const DatasetViewer = ({dataset, updateDatasetFiles}) => {

	// declare states
	const [expandedModuleKeys, setExpandedModuleKeys] = useState({});
	const [files, setFiles] = useState(dataset.files || []);
	const [key, setKey] = useState( (dataset.files && dataset.files.length > 0) ? parseInt(dataset.files[dataset.files.length-1].key) : 0 ); // initialize with the key of the last file
	const [selectedFiles, setSelectedFiles] = useState({});


	// Function to handle adding a folder with files to the dataset
	const addFilesFolder = (folderFiles) => {
    if (folderFiles.length === 0) return;
		// extract folder name from the first file's path
		// split the folder name on the last underscore if it exists
    let folderName = folderFiles[0].webkitRelativePath.split('/')[0];
    let baseFolderName = folderName;
    let suffix = 0;
    const lastUnderscoreIndex = folderName.lastIndexOf('_');
    if (lastUnderscoreIndex !== -1 && !isNaN(folderName.slice(lastUnderscoreIndex + 1))) {
      baseFolderName = folderName.slice(0, lastUnderscoreIndex); // folder name until last underscore
      suffix = parseInt(folderName.slice(lastUnderscoreIndex + 1), 10); // extract numeric suffix
    }
		// check if a folder with the same name already exists
    // find the next available folder name with a unique suffix
		const existingFolderNames = files.map(file => file.data.name);
    while (existingFolderNames.includes(folderName)) {
        suffix += 1;
        folderName = `${baseFolderName}_${suffix}`; // ensure unique folder name
    }
    // create a folder node with its files as children
		const nextKey = key + 1; // increase the last key value
		setKey(nextKey);
    const folderNode = {
        key: `${nextKey}`,
        data: { name: folderName, type: 'folder', size: null },
        children: folderFiles.map((file, index) => ({
            key: `${nextKey}-${index}`,
            data: {
							name: file.name,
							type: 'file',
							size: globalServices.formatFileSize(file.size),
							status: 'uploadable',
							object: file
						},
        }))
    };
		// Join the folder/files to the dataset file
		const updatedFiles = [...files, folderNode];
		setFiles(updatedFiles); // update local state
		updateDatasetFiles(updatedFiles); // notify parent of changes
	};


	// Function to add multiple files to the TreeTable
	const addMultipleFiles = (selectedFiles) => {
		let currentKey = key; // use current key as the starting point
		const fileNodes = selectedFiles.map((file) => {
				currentKey += 1;
				return {
						key: `${currentKey}`,
						data: {
								name: file.name,
								type: 'file',
								size: globalServices.formatFileSize(file.size),
								status: 'uploadable',
								object: file
						}
				};
		});
		// update the key state to the new value after processing all files
		setKey(currentKey);
		// Join the folder/files to the dataset file
    const updatedFiles = [...files, ...fileNodes];
    setFiles(updatedFiles);
    updateDatasetFiles(updatedFiles);
	};


	// Remove the selected files from the dataset (only fully checked ones)
	const removeInputs = (selectedFilesKeys) => {
		if (!selectedFilesKeys || Object.keys(selectedFilesKeys).length === 0) return; // exit if no files are selected
		// filter out the partialChecked nodes and only keep fully checked nodes
		const fullyCheckedKeys = Object.keys(selectedFilesKeys).filter(key => selectedFilesKeys[key].checked === true);
		// function to mark files as "deletable" by key and filter out null files
		const markFilesAsDeletable = (file) => {
			if (fullyCheckedKeys.includes(file.key)) {
				// file.data.status = 'deletable'; // mark file as deletable
					if ( ('status' in file.data && file.data.status === 'upload') || ('type' in file.data && file.data.type === 'folder') ) {
						file.data.status = 'deletable'; // mark file as deletable
					}
					else if ('status' in file.data && file.data.status === 'uploadable') {
						return null; // not was in the server, just in local, so remove from treetable
					}
			}
			// if the file has children (folder),
			// recursively mark files as deletable and,
			// filter out null children
			if (file.children && file.children.length > 0) {
				file.children = file.children
					.map(child => markFilesAsDeletable(child))
					.filter(child => child !== null);
			}
			return file;
		};
		// function to reorder the keys recursively
		const reorderKeys = (files, parentKey = '') => {
			return files.map((file, index) => {
				const newKey = parentKey === '' ? `${index}` : `${parentKey}-${index}`; // generate new key
				file.key = newKey;
				if (file.children && file.children.length > 0) {
					file.children = reorderKeys(file.children, newKey);
				}
				return file;
			});
		};
		// iterate over files and update the structure by marking files as "deletable"
		let updatedFiles = files.map(file => markFilesAsDeletable(file)).filter(file => file !== null);
		// reorder the keys to ensure sequential key values after marking as deletable
		updatedFiles = reorderKeys(updatedFiles);
		// update local state and notify the parent component
		setFiles(updatedFiles);
		updateDatasetFiles(updatedFiles);
		// clear the selection after removing inputs
    setSelectedFiles({});
	};


	// Functions that freeze the elements opened in the file tree (viewer)
	const handleModuleExpand = (e) => {
		setExpandedModuleKeys(e.value);
	};


	// Render
	return (
		<Panel header="Add/Remove folder/files into your dataset:">
			<DatasetFileViewer
				files={files}
				expandedKeys={expandedModuleKeys}
				onToggle={handleModuleExpand}
				addFiles={addMultipleFiles}
				addFilesFolder={addFilesFolder}
				removeInputs={removeInputs}
				selectedFiles={selectedFiles}
				setSelectedFiles={setSelectedFiles}
			/>
		</Panel>
	);
};




/** 
 * Component that displays the dataset button
 */
const DatasetOperation = ({auth, id, dataset, operation, setDatasetId, updateDatasetFiles, updateProgress, refreshDataset}) => {

	// State to track whether update or create process is running
	const [isProcessing, setIsProcessing] = useState(false);

	// Update the dataset from the new treetable
	const createDataset = async (data) => {
		setIsProcessing(true);		
		// create the dataset instance
		const id = await createData(data, auth);
		if (id) {
			// upload the files from file table
			await updateFiles(id, data.files);
			// refetch dataset after creation
			refreshDataset();
		}
		setIsProcessing(false);
	};

	// Update the dataset from the new treetable
  const updateDataset = async (id, dataset) => {
		setIsProcessing(true);
		// update the files (add and remove)
		await updateFiles(id, dataset.files);
		// update the dataset info
		await updateData(id, dataset);
		// refetch dataset after creation
		refreshDataset();
		setIsProcessing(false);
	};

  // Create dataset instance
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
          showInfo('', 'The dataset was created correctly');
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

  // Function to recursively find all files with the status "uploadable" or "deletable"
	const findFilesByStatus = (files) => {
		let filesToUpload = [], filesToDelete = [];
		// recursive function to traverse files and track parent folder name
		// if the file is a folder, traverse its children and pass the current folder name
		const traverseFiles = (fileList, parent = null) => {
			fileList.forEach(file => {
				if (file.children && file.children.length > 0) {
					traverseFiles(file.children, file.data.name);
				} else if (file.data.status === 'uploadable') {
					filesToUpload.push({...file, parent});
				} else if (file.data.status === 'deletable') {
					filesToDelete.push({...file, parent});
				}
			});
		};	
		// start traversing files, initial parent folder is null
		traverseFiles(files);
		// return both lists
		return {
			uploadableFiles: filesToUpload,
			deletableFiles: filesToDelete
		};
	};
	
  // Update the files (add and remove files)
  const updateFiles = async (id, files) => {		
		// find all files with the status "load"
		const filesByStatus = findFilesByStatus(files);
		let updatedFiles = [...files]; // clone just in case
		// update uploadable files
		for (let file of filesByStatus.uploadableFiles) {
			try {
				if ( 'parent' in file ) {
					// update status to "uploading" before upload
					file.data.status = 'uploading';
					updateDatasetFiles(updatedFiles);
					// call the upload service
					if ( file.parent === null ) {
						await datasetServices.up(id, 'file-path', globalServices.getBaseName(file.data.name), file.data.object, (progress) => {
							updateProgress(progress);
						});
					}
					else if ( file.parent ) {
						await datasetServices.up(id, 'directory-path', file.parent, file.data.object, (progress) => {
							updateProgress(progress);
						});
					}
					else { continue; }
					// change status to "upload" after successful upload
					file.data.status = 'upload';
					updateDatasetFiles(updatedFiles);
				}
			} catch (error) {
				let e = `Failed to upload ${file.data.name}`
				showError('', e);
				console.error(`${e} : ${error}`);
			}
		}
		// update deletable files
		for (let file of filesByStatus.deletableFiles) {
			try {
				if ( 'parent' in file ) {
					// update status to "deleting" before upload
					file.data.status = 'deleting';
					updateDatasetFiles(updatedFiles);
					// call service
					if ( file.parent === null ) {
						await datasetServices.remove(id, {'filenames': [file.data.name]}, (progress) => {
							updateProgress(progress);
						});
					}
					else if ( file.parent ) {
						await datasetServices.remove(id, {'filenames': [`${file.parent}/${file.data.name}`]}, (progress) => {
							updateProgress(progress);
						});
					}
					else { continue; }

					// change status
					file.data.status = 'deleted';
					updateDatasetFiles(updatedFiles);
				}
			} catch (error) {
				let e = `Failed to delete ${file.data.name}`
				showError('', e);
				console.error(`${e} : ${error}`);
			}
		}
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
				if (result && result._id) {
					showInfo('', 'The dataset was updated correctly');
				}
				else {  
					showError('', 'The dataset was not updated correctly');
					console.error('The dataset was not updated correctly.');
				}
			}
		} catch (error) {
			showError('', 'Processing the data for the POST request during dataset update');
			console.error('Error: making a POST request during dataset update: ', error);
		}
	};
	
	// Render
	return (
		<div className="field dataset-submit flex justify-content-center">
			{ operation === 'create' ? <Button label="Create" onClick={() => createDataset(dataset)} disabled={isProcessing} /> : <Button label="Update" onClick={() => updateDataset(id, dataset)} disabled={isProcessing} /> }
		</div>
	);
};



/**
 * DatasetFileViewer: This component creates a TreeTable for the files of modules and logs.
 */
const DatasetFileViewer = ({files, expandedKeys, onToggle, addFiles, addFilesFolder, removeInputs, selectedFiles, setSelectedFiles}) => {

	// Declare states and references
	const fileInputRef = useRef(null); // reference to file input
	const folderInputRef = useRef(null); // Reference to folder input

	// Status template
	const StatusMessage = ({ status }) => {
		const severity = {
			'uploadable': 'info',
			'deletable':  'info',
			'deleting':   'warning',
			'uploading':  'warning',
			'upload':     'success'
		}[status];
	
		return ( <Tag rounded value={status} severity={severity} /> );
	};
	const statusBodyTemplate = (rowData) => {
		return ( rowData['data'].status ? <StatusMessage status={rowData['data'].status} /> : <></> );
  };

  // Filter files to exclude subfolders and check file size
	const controlFiles = (files) => {
		// only keep files in the main folder
		const auxFilteredFiles = files.filter(file => {
			const relativePath = file.webkitRelativePath;
			return relativePath.split('/').length <= 2;
		});
		//only keep files in the main folder and files smaller than MAX_FILE_SIZE
		const filteredFiles = auxFilteredFiles.filter(file => {
			return file.size <= MAX_FILE_SIZE;
		});
		// provide feedback to the user if files were excluded due to size
		const largeFiles = auxFilteredFiles.filter(file => file.size > MAX_FILE_SIZE).map(file => file.name);;
		if (largeFiles.length > 0) {
			showWarning('',`Some files are too large and were excluded:  ${largeFiles.join(', ')}`);
		}
		return filteredFiles;
	};

	// Handle multiple file selection and add files to TreeTable
	const handleFileSelection = (event) => {
		const files = Array.from(event.target.files);
		addFiles( controlFiles(files) ); // control files
	};
	// Handle folder selection and add folder + files to TreeTable
	const handleFolderSelection = (event) => {
		const files = Array.from(event.target.files);
		addFilesFolder( controlFiles(files) ); // control files
	};

	// Button to trigger file selection
	const triggerFileSelection = () => {
		fileInputRef.current.click();
	};
	// Button to trigger folder selection
	const triggerFolderSelection = () => {
		folderInputRef.current.click();
	};

	// Create header with action buttons and progress bar
	const header = (
		<div className="header-button justify-content-start">
			<Button icon="pi pi-file-plus" rounded raised onClick={triggerFileSelection}/>
			{/* Hidden folder input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				style={{ display: 'none' }}
				onChange={handleFileSelection}
			/>
			<Button icon="pi pi-folder-plus" rounded raised onClick={triggerFolderSelection} />
			{/* Hidden folder input */}
			<input
				ref={folderInputRef}
				type="file"
				webkitdirectory="true"
				style={{ display: 'none' }}
				onChange={handleFolderSelection}
			/>
			<Button icon="pi pi-minus" severity="danger" rounded raised onClick={() => removeInputs(selectedFiles)}/>
			{/* Render the ProgressBar when progress is greater than 0 */}
			{/* {progress > 0 && ( <ProgressBar value={progress} /> )} */}
		</div>
	);

	// Render
	return (
		<div className='field file-viewer'>
			<TreeTable
				selectionMode="checkbox"
				scrollable
				value={files}
				header={header}
				selectionKeys={selectedFiles}
				onSelectionChange={(e) => setSelectedFiles(e.value)}
				tableStyle={{inWidth:'50rem'}}
				expandedKeys={expandedKeys}
				onToggle={onToggle} >
					<Column field="name"   header="Name" expander></Column>
					<Column field="size"   header="Size" className="short-column"></Column>
					<Column field="type"   header="Type" className="short-column"></Column>
					<Column field="status" header="Status" className="short-column" body={statusBodyTemplate} />
			</TreeTable>
		</div>
	);
};


/**
 * InputTextParameter: creates a section for the InputText parameter.
 */
const InputTextParameter = ({ name, label, value, onChange }) => {
	return (
		<div className={`field ${name}`}>
			<label htmlFor={`input-text-${name}`}>{label}</label>
			<InputText id={`input-text-${name}`} className='w-full' maxLength='150' value={value} onChange={onChange}/>
		</div>
	);
};

export default Dataset;