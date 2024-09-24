/**
 * datasetServices is a class that defines the methods used to connect to the 'dataset' REST API.
 */


// Import libraries/constants
import {
  BACKEND_URL, 
} from '../constants';




export class datasetServices {


  /**
   * "fetchWithAuth" is a private method that handles fetch requests with authorization.
   * It retrieves the token from sessionStorage and includes it in the Authorization header.
   * @param {String} url - The URL to which the request is sent.
   * @param {Object} options - Additional options for the fetch request, such as method, headers, and body.
   * @returns {Response} - The fetch response object if successful.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('token'); // retrieve token directly inside fetchWithAuth
    if (!token) return null;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers, // allow custom headers to be added
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  
  /**
   * "get" retrieves all datasets or a specific dataset by ID.
   * @param {String|null} id - The workflow identifier (optional). If null, retrieves all datasets.
   * @returns {Object|null} - The workflow object or list of datasets if found, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async get(id = null) {
    try {
      const url = id ? `${BACKEND_URL}/api/datasets/${id}` : `${BACKEND_URL}/api/datasets`;
      const response = await this.fetchWithAuth(url, {
        method: 'GET',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  /**
   * "create" creates a new dataset instance based on the provided data.
   * @param {Object} data - The data used to create the dataset.
   * @returns {Object|null} - The created dataset object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async create(data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/datasets/0`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


  /**
   * "edit" update a dataset instance based on the provided data.
   * @param {Object} data - The data used to create the dataset.
   * @returns {Object|null} - The created dataset object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async edit(id, data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/datasets/${id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


 /**
   * "up" uploads a single file to a specific dataset.
   * @param {String} id - The dataset identifier.
   * @param {String} format - The format of the dataset.
   * @param {String} parameter - The specific parameter associated with the file.
   * @param {File} file - The file object to be uploaded.
   * @param {Function} onProgress - A callback function to handle progress updates.
   * @returns {Promise<Object>} - Resolves with the server response if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the upload fails.
   */
  static async up(id, format, parameter, file, onProgress) {

    const token = sessionStorage.getItem('token'); // retrieve token directly inside fetchWithAuth
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


  /**
   * "upload" uploads multiple files to a specific dataset.
   * @param {String} id - The dataset identifier.
   * @param {String} format - The format of the dataset.
   * @param {String} parameter - The specific parameter associated with the files.
   * @param {File[]} files - An array of file objects to be uploaded.
   * @param {Function} onProgress - A callback function to handle overall progress updates.
   * @returns {Promise<Object[]>} - Resolves with an array of server responses for each file if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if any of the uploads fail.
   */
  static async upload(id, format, parameter, files, onProgress) {

    const token = sessionStorage.getItem('token'); // retrieve token directly inside fetchWithAuth
    if (!token) return null;

    const totalFiles = files.length;
    let completedFiles = 0;

    const uploadPromises = Array.from(files).map(file => {
        return this.up(id, format, parameter, file, (progress) => {
            // calculate the overall progress
            const overallProgress = ((completedFiles + (progress / 100)) / totalFiles) * 100;
            onProgress(overallProgress);
        }).then(result => {
            completedFiles++;
            return result;
        });
    });
    
    return await Promise.all(uploadPromises);
  }

  /**
   * "delete" a dataset instance based on the provided id.
   * @param {String} id - The dataset identifier.
   * @returns {Object|null} - The created dataset object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async delete(id) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/datasets/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  /**
   * "remove" files based on the dataset id and file names.
   * @param {String} id - The dataset identifier.
   * @param {Object} data - The data used to remove the files from a dataset.
   * @returns {Object|null} - The created dataset object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async remove(id, data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/datasets/${id}/delete`, {
        method: 'DELETE',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

};
  