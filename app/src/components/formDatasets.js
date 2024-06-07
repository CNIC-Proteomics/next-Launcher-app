/*
 * Import libraries
 */

import React, {
  useState,
//   useEffect,
  useRef
} from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import {
  BACKEND_URL,
  MAX_FILE_SIZE
} from '../constants';
import {
  showInfo,
  showError,
//   showWarning
} from '../services/toastServices';
import { datasetServices } from '../services/datasetServices';
  


/*
 * Components
 */


/* Create section to string parameters */
export const StringDataset = ({properties}) => {
    const [setTextValue] = useState('');
    return (
        <div className="flex flex-column gap-2">
            <label>{properties.description}</label>
            <div className='string-dataset p-inputgroup flex'>
                <InputText id={properties.title} aria-describedby={`${properties.title}-help`} value={properties.default} onChange={(e) => setTextValue(e.target.value)} />
            </div>
            <small id={`${properties.title}-help`}>{properties.help_text}</small>
        </div>
    );
};


/* Create section to upload files from a folder */
export const FolderDatasetUpload = ({properties}) => {
    const toast = useRef(null);
    const [totalSize, setTotalSize] = useState(0);
    const fileUploadRef = useRef(null);
    
    const onTemplateSelect = (e) => {
        let _totalSize = totalSize;
        let files = e.files;

        Object.keys(files).forEach((key) => {
            _totalSize += files[key].size || 0;
        });

        setTotalSize(_totalSize);
    };

    const onTemplateUpload = (e) => {
        let _totalSize = 0;

        e.files.forEach((file) => {
            _totalSize += file.size || 0;
        });

        setTotalSize(_totalSize);
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    };

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
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
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
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
        <label>{properties.description}</label>
        <div className="multiple-file-dataset">
            <Toast ref={toast}></Toast>
            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" className="custom-upload-btn-tooltip" style={{fontSize: '10px'}}/>
            <FileUpload ref={fileUploadRef} name="demo[]"
                url={`${BACKEND_URL}/api/datasets/6655cf81ee5ebcbfb876848f/directory-path/re_files/upload`}
                multiple
                accept="*"
                maxFileSize={MAX_FILE_SIZE}
                onUpload={onTemplateUpload}
                onSelect={onTemplateSelect}
                onError={onTemplateClear}
                onClear={onTemplateClear}
                headerTemplate={headerTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions} 
            />
        </div>
        <small id={`${properties.title}-help`}>{properties.help_text}</small>
    </div>
    );
};

/* Create section to upload a single file */
export const FileDatasetUpload = ({ properties }) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    // const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = () => {
        fileInputRef.current.click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setUploadProgress(0);  // Reset progress when a new file is selected
    };
    // const onFileChange = (e) => {
    //     setSelectedFiles(e.target.files);
    //     setUploadProgress(0);  // Reset progress when a new file is selected
    // };

    const onUpload = async () => {
        showInfo('','Uploading...');
        try {            
            await datasetServices.upload('66633eea16729f51f38e8e66', 'file-path', 'exp_table', selectedFile);
            // await fileUpload.uploadFiles(selectedFiles);
            showInfo('','File uploaded successfully');
        } catch (error) {
            showError('','File upload failed');
            console.error('Error: File upload failed: ', error);
        }
    };

    // const onUpload = () => {
    //     if (!selectedFile) {
    //         showWarning('','No file selected for upload')
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append('file', selectedFile);

    //     const xhr = new XMLHttpRequest();
    //     xhr.open('POST', `${BACKEND_URL}/api/datasets/6655cf81ee5ebcbfb876848f/directory-path/re_files/upload`, true);

    //     xhr.upload.onprogress = (event) => {
    //         if (event.lengthComputable) {
    //             const progress = Math.round((event.loaded * 100) / event.total);
    //             setUploadProgress(progress);
    //         }
    //     };

    //     xhr.onload = () => {
    //         if (xhr.status === 200) {
    //             showInfo('', 'File uploaded successfully');
    //             console.log('File uploaded successfully.');
    //         } else {
    //             showError('','File upload failed');
    //             console.error('File upload failed.');
    //         }
    //     };

    //     xhr.send(formData);
    // };

    return (
        <div className="flex flex-column gap-2">
            <label>{properties.description}</label>
            <div className="single-file-dataset p-inputgroup flex">
                <Button label="Select File" icon="pi pi-file-import" className='border-round-left-md' onClick={handleFileSelect} />
                <InputText value={selectedFile ? selectedFile.name : ''} placeholder="No file selected" readOnly />
                <Button label="Upload" icon="pi pi-upload" className='border-round-right-md p-button-success' onClick={onUpload} outlined />
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                />
            </div>
            { uploadProgress > 0 && (<ProgressBar value={uploadProgress} style={{height:'8px', fontSize: '7px'}} />) }
            <small id={`${properties.title}-help`}>{properties.help_text}</small>
        </div>
    );
};
