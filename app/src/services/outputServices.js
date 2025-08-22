/**
 * outputServices is a class that defines the methods used to connect to the 'outputs' REST API
 */


// Import libraries/constants
import * as globalServices from './globalServices';
import { BACKEND_URL } from '../constants';



export class outputServices {


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
   * "get" retrieves the outputs files from an attempt execution of a workflow.
   * @param {String} id - The workflow identifier (alphanumeric).
   * @param {Integer} attempt - The attempt identifier (integer).
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async get(id, attempt) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/outputs/${id}/${attempt}`, {
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
   * "archive" retrieves the archive file from an attempt execution of a workflow.
   * @param {String} id - The workflow identifier (alphanumeric).
   * @param {Integer} attempt - The attempt identifier (integer).
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async archive(id, attempt, abortController) {
    try {
      // const response = await this.fetchWithAuth(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`, {
      //   signal: abortController.signal,
      // });
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`, abortController);

      const blob = await response.blob();
      const filename = `outputs-${id}-${attempt}.zip`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.debug('Fetch aborted:', error.message); // Log when fetch is aborted
      } else {
        console.error('Error downloading archive:', error);
        throw error;
      }
    }
  }


  /**
   * "single" downloads the given output file for an attempt execution of a workflow.
   * @param {String} path - Path of directory.
   * @param {String} file - Path of file.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async single(path, file) {
    try {
      const encodedFile = encodeURIComponent(file); // encode the file name to handle special characters like #
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/outputs/single/${path}/${encodedFile}/download`);

      const blob = await response.blob();
      const filename = globalServices.getFileName(file);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }
  



  // static async archive(id, attempt) {
  //   try {
  //     const response = await fetch(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`);
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  
  //     const blob = await response.blob();
  //     const filename = `outputs-${id}-${attempt}.zip`;
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //   } catch (error) {
  //     console.error('Error downloading archive:', error);
  //     throw error;
  //   }
  // }



  // static async archive(id, attempt) {
  //   try {
  //     fetch(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`)
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.blob();
  //     })
  //     .then(blob => {
  //       const url = window.URL.createObjectURL(new Blob([blob]));
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.setAttribute('download', `outputs-${id}-${attempt}.zip`);
  //       document.body.appendChild(link);
  //       link.click();
  //       link.parentNode.removeChild(link);
  //     })
  //     .catch(error => {
  //       console.error('Error during download:', error);
  //       // Handle error as needed
  //     });
  //   } catch (error) {
  //     console.error('Error:', error);
  //     throw error;
  //   }
  // }


  // static async archive(id, attempt, cancelToken) {

  //   try {
  //     console.log("archive");
  //     console.log( cancelToken );
  //     const response = await axios.get(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`, {
  //       responseType: 'blob', // specify response type as blob for binary data
  //       cancelToken: cancelToken.token, // pass the cancel token from the caller
  //     });
  
  //     // Example handling of the blob response
  //     const blob = new Blob([response.data], { type: response.headers['content-type'] });
  //     const filename = `outputs-${id}-${attempt}.zip`;
  
  //     // Create a URL for the blob data and create a link element to trigger download
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  
  //     // optionally return something if needed after successful download
  //     return { success: true };
  //   } catch (error) {
  //     if (axios.isCancel(error)) {
  //       console.log('Request canceled:', error.message);
  //       // Handle cancellation specific logic or UI update
  //       throw new Error('Download canceled by user'); // propagate cancellation to caller
  //     } else {
  //       console.error('Error downloading archive:', error);
  //       // Handle other errors (network failure, server errors, etc.)
  //       throw new Error('Download failed'); // propagate error to caller
  //     }
  //   }
  // }
  
  // static async archive(id, attempt) {
    // try {
    //   const response = await fetch(`${BACKEND_URL}/api/outputs/archive/${id}/${attempt}/download`, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
  
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
  
    //   // Get the filename from Content-Disposition header if available
    //   const contentDisposition = response.headers.get('Content-Disposition');
    //   let filename = `outputs-${id}-${attempt}.zip`; // Default filename
  
    //   if (contentDisposition) {
    //     const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    //     const matches = filenameRegex.exec(contentDisposition);
    //     if (matches && matches[1]) {
    //       filename = matches[1].replace(/['"]/g, '');
    //     }
    //   }
  
    //   // Convert response to blob
    //   const blob = await response.blob();
  
    //   // Create a temporary URL to the blob
    //   const url = window.URL.createObjectURL(new Blob([blob]));
  
    //   // Create a link element
    //   const link = document.createElement('a');
    //   link.href = url;
    //   link.setAttribute('download', filename);
  
    //   // Append the link to the body
    //   document.body.appendChild(link);
  
    //   // Trigger the download
    //   link.click();
  
    //   // Clean up: remove the link and revoke the URL object
    //   link.parentNode.removeChild(link);
    //   window.URL.revokeObjectURL(url);
  
    // } catch (error) {
    //   console.error('Error:', error);
    //   throw error;
    // }
  // }

};
  