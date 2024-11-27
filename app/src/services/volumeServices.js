/**
 * volumeServices is a class that defines the methods used to connect to the 'volume' REST API.
 */


// Import libraries/constants
import {
  BACKEND_URL, 
} from '../constants';




export class volumeServices {


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
   * "removeFiles" filters out specified files from each volume's files array.
   * If it's a single volume object, filter specified files directly.
   * @param {Object|Object[]} volumes - A single volume object or an array of volumes.
   * @param {String[]} filenames - An array of filenames to remove (e.g., ["meta.json", "anotherFile.txt"]).
   * @returns {Object|Object[]} - The volume object or list of volumes with specified files removed.
   */
  static removeFiles(volumes, filenames) {
    try {
      if (!Array.isArray(volumes)) {
        return {
          ...volumes,
          files: volumes.files.filter(file => !filenames.includes(file.data.name)),
        };
      }
      // Otherwise, don't change the result
      else { return volumes }  
    } finally {
      return volumes
    }
  }


  /**
   * "get" retrieves all volumes or a specific volume by ID.
   * @param {String|null} id - The workflow identifier (optional). If null, retrieves all volumes.
   * @returns {Object|null} - The workflow object or list of volumes if found, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async get(id = null) {
    try {
      const url = id ? `${BACKEND_URL}/api/volumes/${id}` : `${BACKEND_URL}/api/volumes`;
      const response = await this.fetchWithAuth(url, {
        method: 'GET',
      });

      const result = await response.json();
      return this.removeFiles(result, ['meta.json']); // filter out specified files
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

};