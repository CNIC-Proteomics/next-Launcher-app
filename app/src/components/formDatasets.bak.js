/*
 * Import libraries
 */

import { BACKEND_URL } from './constants';
import React, { useState, useRef, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';

import { ProductService } from './service/ProductService';


/*
 * Functions
 */

/* Create section to upload files from a folder */
export const FolderDatasetUpload = ({properties}) => {

    const folderInputRef = useRef(null);
  
    const handleFolderSelect = () => {
      folderInputRef.current.click();
    };
  
    const onFolderChange = (e) => {
      const files = Array.from(e.target.files);
      console.log('Selected files:', files);
    };
  
    return (
        <div className="flex flex-column gap-2">
            <label>{properties.description}</label>
            <div className="p-inputgroup flex">
                <Button label="Select Folder" icon="pi pi-folder-open" onClick={handleFolderSelect} className="p-mr-2" />
                <InputText placeholder='' />
                <input
                    type="file"
                    ref={folderInputRef}
                    style={{ display: 'none' }}
                    webkitdirectory="true"
                    mozdirectory="true"
                    directory="true"
                    onChange={onFolderChange}
                />
            </div>
            <small id={`${properties.title}-help`}>{properties.help_text}</small>
        </div>
    );
};

/* Create section to upload a single file */
export const FileDatasetUpload = ({properties}) => {
    const fileInputRef = useRef(null);
  
    const handleFileSelect = () => {
      fileInputRef.current.click();
    };
    
    const onFileChange = (e) => {
      const file = e.target.files[0];
      console.log('Selected file:', file);
    };
    return (
        <div className="flex flex-column gap-2">
            <label>{properties.description}</label>
            <div className="p-inputgroup flex">
                <Button label="Select File" icon="pi pi-file" onClick={handleFileSelect} />
                <InputText placeholder='' />
                <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onFileChange}
                />
            </div>
            <small id={`${properties.title}-help`}>{properties.help_text}</small>
        </div>
    );
};

/* Create section to string parameters */
export const StringDataset = ({properties}) => {
    const [textValue, setTextValue] = useState('');
    return (
        <div className="flex flex-column gap-2">
            <label htmlFor={properties.title} >{properties.description}</label>
            <div className="p-inputgroup flex">
                <InputText id={properties.title} aria-describedby={`${properties.title}-help`} value={properties.default} onChange={(e) => setTextValue(e.target.value)} />
            </div>
            <small id={`${properties.title}-help`}>{properties.help_text}</small>
        </div>
    );
};

/* File list table */
export const FileListDatasetUpload = () => {

    // Initial data
    const [data, setData] = useState([]);

    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [rowClick, setRowClick] = useState(true);

    useEffect(() => {
        ProductService.getProductsMini().then((data) => setProducts(data));
    }, []);

    const headers = [
        { field: "name", header: "Name" },
        { field: "size", header: "Size" },
        { field: "status", header: "Status" }
    ];

    // Function to add new records
    const addRecord = (newRecord) => {
        setData([...data, newRecord]);
    };

    return (
        <div className="card">
            <FileUpload name="demo[]" url={'/api/upload'} multiple accept="*" maxFileSize={10 * 1024 * 1024 * 1024} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
        </div>
        // <div className="card">
        //     <DataTable value={products}
        //         selectionMode={rowClick ? null : 'checkbox'} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)} dataKey="dataset-file-list-upload" tableStyle={{ minWidth:'40rem'}}>
        //         {headers.map((col, index) => (
        //             <Column key={index} field={col.field} header={col.header} />
        //         ))}
        //     </DataTable>
        // </div>
    );

};

// // File upload functions
// export const FileDatasetUpload = () => {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [status, setStatus] = useState("");
//     const [progress, setProgress] = useState(0);
    
//     const handleFileChange = (event) => {
//     const file = event.target.files[0];
//         setSelectedFile(file);
//     };
    
//     const handleFileUpload = () => {
//         if (!selectedFile) {
//             alert("Please select a file to upload.");
//             return;
//         }
    
//         const chunkSize = 5 * 1024 * 1024; // 5MB (adjust based on your requirements)
//         const totalChunks = Math.ceil(selectedFile.size / chunkSize);
//         const chunkProgress = 100 / totalChunks;
//         let chunkNumber = 0;
//         let start = 0;
//         let end = 0;
        
//         const uploadNextChunk = async () => {
//             if (end <= selectedFile.size) {
//                 const chunk = selectedFile.slice(start, end);
//                 const formData = new FormData();
//                 formData.append("file", chunk);
//                 formData.append("chunkNumber", chunkNumber);
//                 formData.append("totalChunks", totalChunks);
//                 formData.append("originalname", selectedFile.name);
        
//                 fetch("http://localhost:8000/upload", {
//                     method: "POST",
//                     body: formData,
//                 })
//                 .then((response) => response.json())
//                 .then((data) => {
//                     console.log({ data });
//                     const temp = `Chunk ${
//                         chunkNumber + 1
//                     }/${totalChunks} uploaded successfully`;
//                     setStatus(temp);
//                     setProgress(Number((chunkNumber + 1) * chunkProgress));
//                     console.log(temp);
//                     chunkNumber++;
//                     start = end;
//                     end = start + chunkSize;
//                     uploadNextChunk();
//                 })
//                 .catch((error) => {
//                     console.error("Error uploading chunk:", error);
//                 });
//             } else {
//                 setProgress(100);
//                 setSelectedFile(null);
//                 setStatus("File upload completed");
//             }
//         };
        
//         uploadNextChunk();
//     }; // end handleFileUpload
    
//     return (
//         // <div>
//         //     <h2>Resumable File Upload</h2>
//         //     <h3>{status}</h3>
//         //     {progress > 0 && <ProgressBar now={progress} />}
//         //     <input type="file" onChange={handleFileChange} />
//         //     <Button onClick={handleFileUpload}>Upload File</Button>
//         // </div>
//     <>
//       <Form.Group controlId="formFile" className="mb-3">
//         <Row>
//             <Col>
//                 <Form.Control type="file" onClick={handleFileChange} />
//             </Col>
//             <Col sm={2}>
//                 <Button variant="outline-secondary" id="button-addon2" onClick={handleFileUpload}>Upload file</Button>
//             </Col>
//         </Row>
//         <Row>
//             <Col>
//             {/* {progress > 0 && <Progress animated color='success' striped style={{height:'3px'}} value={progress} />} */}
//             {<ProgressBar animated color='success' striped style={{height:'3px'}} now={60} />}
//             </Col>
//             <Col sm={2}></Col>
//         </Row>
        
//       </Form.Group>

//       <InputGroup className="mb-3">
//         <Form.Control
//           placeholder="Recipient's username"
//           aria-label="Recipient's username"
//           aria-describedby="basic-addon2"
//         />
//         <input type="file" onChange={handleFileChange} />
//         <Button variant="outline-secondary" id="button-addon2" onClick={handleFileUpload}>Select file</Button>
//         {progress > 0 && <ProgressBar now={progress} />}
//         </InputGroup>
//     </>
//     );
// };


// // This functions adds the list of files into table
// export const FolderDatasetChange = (event) => {
//     // const [selectedFile, setSelectedFile] = useState(null);

//     const files = event.target.files;
//     console.log(files);
//     // setSelectedFile(files);
// };

// // This functions adds the file into table
// // export const FileDatasetChange = (e, setFormData) => {
// //     const { name, value } = e.target;
// //     setFormData((prevFormData) => ({
// //         ...prevFormData,
// //         [name]: value,
// //     }));
// // };
// export const FileDatasetChange = (event) => {
//     // const [selectedFile, setSelectedFile] = useState(null);

//     const files = event.target.files[0];
//     console.log(files);
//     // setSelectedFile(files);
// };


// export const datasetSubmit = async (e, formData) => {
//   e.preventDefault();
//   try {
//     const response = await fetch(BACKEND_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(formData),
//     });
//     if (response.ok) {
//       const result = await response.json();
//       console.log('Success:', result);
//     } else {
//       console.error('Error:', response.statusText);
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

// export default FileDatasetUpload;