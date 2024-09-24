/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from "primereact/inputswitch";
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
// import { Message } from 'primereact/message';
// import classNames from 'classnames';
import {
  MAX_FILE_SIZE
} from '../constants';
import {
  showInfo,
  showError,
  showWarning
} from '../services/toastServices';
import { datasetServices } from '../services/datasetServices';
  


/*
 * Components
 */



/**
 * DatasetFileViewer: This component creates a TreeTable for the files of modules and logs.
 */
export const DatasetFileViewer = ({label, files, expandedKeys, onToggle, addFiles, addFilesFolder, removeInputs, progress, selectedFiles, setSelectedFiles}) => {

	// Declare states and references
	// const [selectedFiles, setSelectedFiles] = useState(null);
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
			{progress > 0 && ( <ProgressBar value={progress} /> )}
		</div>
	);

	// Render
	return (
		<div className='field file-viewer'>
			<label>{label}</label>
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
export const InputTextParameter = ({ name, label, value, onChange }) => {
	return (
		<div className={`field ${name}`}>
			<label htmlFor={`input-text-${name}`}>{label}</label>
			<InputText id={`input-text-${name}`} className='w-full' maxLength='150' value={value} onChange={onChange}/>
		</div>
	);
};





/* Create section to string parameters */
export const DescriptionParameter = ({ title, postData }) => {

	// Declare constants
	const [value, setValue] = useState('');

	// Function to handle the change event
	const onChange = (e) => {
		const newValue = e.target.value;
		setValue(newValue);
		// save the list of files into POST data for parent component
		// create the input parameter path for workflow request
		let valuePOST = newValue;
		postData['description'] = valuePOST;
	};

	return (
		<div className="field">
			<label htmlFor="workflow-description">Describe briefly your <strong>{title}</strong> workflow:</label>
			<InputText id="workflow-description" className="w-full" maxLength='138' value={value} onChange={onChange}/>
		</div>
	);
};




/**
 * StringParameter: creates a section for the type parameter, string.
 */
export const StringParameter = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {

    const [value, setValue] = useState('');

    // Initialize the state with the prop value
    useEffect(() => {
        const newValue = property.default;
        setValue(newValue);
        // save the list of files into POST data for parent component
        // create the input parameter path for workflow request
        let valuePOST = newValue;
        let keyPOST = property.title;
        postData[keyPOST] = {
            'name': `--${propertyKey}`,
            'type': propertyFormat,
            'value': valuePOST
        };
    }, [property, propertyFormat, propertyKey, postData]);

    // Function to handle the change event
    const onChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        // save the list of files into POST data for parent component
        // create the input parameter path for workflow request
        let valuePOST = newValue;
        let keyPOST = property.title;
        postData[keyPOST] = {
            'name': `--${propertyKey}`,
            'type': propertyFormat,
            'value': valuePOST
        };
    };

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
            <small id={`${property.title}-help`}>{property.help_text}</small>
        </div>
    );
};





/**
 * BooleanParameter: creates a section for the type parameter, boolean.
 */
export const BooleanParameter = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {
	const [value, setValue] = useState(true);


	// Initialize the state with the prop value
	useEffect(() => {
			const newValue = property.default;
			setValue(newValue);
			// save the list of files into POST data for parent component
			// create the input parameter path for workflow request
			let valuePOST = newValue;
			let keyPOST = property.title;
			postData[keyPOST] = {
					'name': `--${propertyKey}`,
					'type': propertyFormat,
					'value': String(valuePOST) // convert boolean to string
			};
	}, [property, propertyFormat, propertyKey, postData]);

	// Function to handle the change event
	const onChange = (e) => {
			const newValue = e.target.value;
			setValue(newValue);
			// save the list of files into POST data for parent component
			// create the input parameter path for workflow request
			let valuePOST = newValue;
			let keyPOST = property.title;
			postData[keyPOST] = {
					'name': `--${propertyKey}`,
					'type': propertyFormat,
					'value': String(valuePOST) // convert boolean to string
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
					<small id={`${property.title}-help`}>{property.help_text}</small>
			</div>
	);
};






/* Create section to upload files from a folder */
export const FolderParameterUpload = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {
    const fileUploadRef = useRef(null);
    const [totalSize, setTotalSize] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Initialize the POST data with the key property
    useEffect(() => {
        // init data for the POST request
        let keyPOST = property.title;
        postData[keyPOST] = {};
    }, [property, postData]);

    
    const onSelect = (e) => {
        let _totalSize = totalSize;
        let selectedFiles = e.files
        Object.keys(selectedFiles).forEach((key) => {
            _totalSize += selectedFiles[key].size || 0;
        });
        setTotalSize(_totalSize);
    };

    const onUpload = async (e) => {
        // get the files
        // const files = fileUploadRef.current.getFiles();
        const selectedFiles = e.files
        // create Total Size value
        let _totalSize = 0;
        selectedFiles.forEach((file) => {
            _totalSize += file.size || 0;
        });
        setTotalSize(_totalSize);
        // reset progress when a new file is selected
        setUploadProgress(0);
        // upload files
        showInfo('','Uploading...');
        try {
            await datasetServices.upload(datasetId, propertyFormat, propertyKey, selectedFiles, (progress) => {
                setUploadProgress(progress);
            });
            // save the list of files into POST data for parent component
            // create the input parameter path for workflow request
            let valuePOST = `${datasetId}/${propertyKey}/*`;
            let keyPOST = property.title;
            postData[keyPOST] = {    
                'name': `--${propertyKey}`,
                'type': propertyFormat,
                'value': valuePOST
            };
            // toast message
            showInfo('','File uploaded successfully');
        } catch (error) {
            showError('','File upload failed');
            console.error('Error: File upload failed: ', error);
        }
    };

    const onRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    };

    const onClear = () => {
        setTotalSize(0);
        // init data for the POST request
        postData[propertyKey] = '';
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue}</span>
                </div>
            </div>
        );
    };

    const progressBarTemplate = () => {
        return (
            <>
            { uploadProgress > 0 && (<ProgressBar value={uploadProgress} showValue={false} />) }
            </>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    <span className="flex flex-column text-left ml-3">{file.name}</span>
                </div>
                <div className="flex align-items-center" style={{ width:'36%' }}>
                    <span className="flex flex-column text-right ml-3"><small>{new Date().toLocaleDateString()}</small></span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-2 py-2" />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                    onClick={() => onRemove(file, props.onRemove)} />
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-file-import mt-1 p-5" style={{ fontSize: '3em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ color: 'var(--text-color-secondary)' }} >Drag and Drop Files Here</span>
            </div>
        );
    };

    const chooseOptions = { icon: 'pi pi-fw pi-file-import', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const uploadOptions = { icon: 'pi pi-fw pi-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    return (
    <div className="flex flex-column gap-2">
        <label>{property.description}</label>
        <div className="multiple-file-dataset">
            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <Tooltip target=".custom-cancel-btn" content="Cancel" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <FileUpload
                name="folder_dataset_upload[]"
                ref={fileUploadRef}
                multiple
                accept="*"
                mode="advanced"
                auto={false}
                maxFileSize={MAX_FILE_SIZE}
                customUpload={true}
                uploadHandler={onUpload}
                onSelect={onSelect}
                onError={onClear}
                onClear={onClear}
                headerTemplate={headerTemplate}
                progressBarTemplate={progressBarTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions} 
            />
        </div>
        <small id={`${property.title}-help`}>{property.help_text}</small>
    </div>
    );
};





/* Create section to upload a single file */
export const FileParameterUpload = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {
    const fileUploadRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Initialize the POST data with the key property
    useEffect(() => {
        // save data for the POST request
        let keyPOST = property.title;
        postData[keyPOST] = {};
    }, [property, postData]);

    const handleFileSelect = () => {
        fileUploadRef.current.click();
    };

    const onFileChange = (e) => {
        setSelectedFiles(e.target.files);
        setUploadProgress(0);  // Reset progress when a new file is selected
    };

    const getExtension = (filename) => {
        const index = filename.lastIndexOf('.');
        return index !== -1 ? filename.substring(index + 1) : '';
    };

    const onUpload = async () => {
        if ( selectedFiles.length > 0 ) {
            // upload files
            showInfo('','Uploading...');
            try {           
                // upload 
                await datasetServices.upload(datasetId, propertyFormat, propertyKey, selectedFiles, (progress) => {
                    setUploadProgress(progress);
                });
                // save the list of files into POST data for parent component
                // crete the input parameter path for workflow request
                let filename = selectedFiles[0].name;
                let valuePOST = `${datasetId}/${propertyKey}.${getExtension(filename)}`;
                let keyPOST = property.title;
                postData[keyPOST] = {
                    'name': `--${propertyKey}`,
                    'type': propertyFormat,
                    'value': valuePOST
                };
                // toast message
                showInfo('','File uploaded successfully');
            } catch (error) {
                showError('','File upload failed');
                console.error('Error: File upload failed: ', error);
            }    
        }
        else {
            showWarning('','No file selected');
        }
    };

    return (
        <div className="flex flex-column gap-2">
            <label>{property.description}</label>
            <div className="single-file-dataset p-inputgroup flex">
                <Button label="Select File" icon="pi pi-file-import" className='border-round-left-md' onClick={handleFileSelect} />
                <InputText value={selectedFiles.length > 0 ? selectedFiles[0].name : ''} placeholder="No file selected" readOnly />
                <Button label="Upload" icon="pi pi-upload" className='border-round-right-md p-button-success' onClick={onUpload} outlined />
                <input
                    type="file"
                    ref={fileUploadRef}
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                />
            </div>
            { uploadProgress > 0 && (<ProgressBar value={uploadProgress} showValue={false} />) }
            <small id={`${property.title}-help`}>{property.help_text}</small>
        </div>
    );
};
