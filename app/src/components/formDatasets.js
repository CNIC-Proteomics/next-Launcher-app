/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import {
  MAX_FILE_SIZE
} from '../constants';
import {
  showInfo,
  showError,
  showWarning,
//   showWarning
} from '../services/toastServices';
import { datasetServices } from '../services/datasetServices';
  


/*
 * Components
 */


/* Create section to string parameters */
export const StringDataset = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {

    const [textValue, setTextValue] = useState('');

    // Initialize the state with the prop value
    useEffect(() => {
        const newValue = property.default;
        setTextValue(newValue);
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
        setTextValue(newValue);
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
                    value={textValue}
                    onChange={onChange}
                />
            </div>
            <small id={`${property.title}-help`}>{property.help_text}</small>
        </div>
    );
};




/* Create section to upload files from a folder */
export const FolderDatasetUpload = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {
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
export const FileDatasetUpload = ({ datasetId, property, propertyFormat, propertyKey, postData }) => {
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
                let valuePOST = `${datasetId}/${selectedFiles[0].name}`;
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
