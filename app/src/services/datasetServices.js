/**
 * datasetServices is a class that defines the methods used to connect to the 'dataset' REST API.
 */


// Import libraries/constants
import {
  BACKEND_URL, 
} from '../constants';




export class datasetServices {

  // get token
  static getToken() {
    return localStorage.getItem('token');
  }

  // create a dataset instance
  static async create(data) {

    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/api/datasets/0`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  // upload a single file
  static async up(id, format, parameter, file, onProgress) {

    const token = this.getToken();
    if (!token) return null;

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BACKEND_URL}/api/datasets/${id}/${format}/${parameter}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`); // set the Authorization header

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentage = Math.round((event.loaded * 100) / event.total);
                onProgress(percentage);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Upload failed'));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Upload failed'));
        };

        xhr.send(formData);
    });
  }

  // upload multiple files
  static async upload(id, format, parameter, files, onProgress) {

    const token = this.getToken();
    if (!token) return null;

    const totalFiles = files.length;
    let completedFiles = 0;

    const uploadPromises = Array.from(files).map(file => {
        return this.up(id, format, parameter, file, (progress) => {
            // Calculate the overall progress
            const overallProgress = ((completedFiles + (progress / 100)) / totalFiles) * 100;
            onProgress(overallProgress);
        }).then(result => {
            completedFiles++;
            return result;
        });
    });
    
    return await Promise.all(uploadPromises);
  }

};
  