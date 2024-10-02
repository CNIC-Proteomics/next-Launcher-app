/**
 * workflowServices is a class that defines the methods used to connect to the 'workflows' REST API
 */


// Import libraries/constants
import { BACKEND_URL } from '../constants';



export class workflowServices {


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
   * "get" retrieves all workflows or a specific workflow by ID.
   * @param {String|null} id - The workflow identifier (optional). If null, retrieves all workflows.
   * @returns {Object|null} - The workflow object or list of workflows if found, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async get(id = null) {
    try {
      const url = id ? `${BACKEND_URL}/api/workflows/${id}` : `${BACKEND_URL}/api/workflows`;
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
   * "create" creates a new workflow based on the provided data.
   * @param {Object} data - The data used to create the workflow.
   * @returns {Object|null} - The created workflow object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async create(data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/workflows/0`, {
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
   * "edit" edits an existing workflow identified by the provided ID.
   * @param {String} id - The workflow identifier.
   * @param {Object} data - The data used to edit the workflow.
   * @returns {Object|null} - The edited workflow object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async edit(id, data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/workflows/${id}`, {
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
   * "launch" launches a workflow identified by the provided ID with the given data.
   * @param {String} id - The workflow identifier.
   * @param {Object} data - The data used to launch the workflow.
   * @returns {Object|null} - The result of the workflow launch if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async launch(id, data) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/workflows/${id}/launch`, {
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
   * "delete" a workflow instance based on the provided id.
   * @param {String} id - The workflow identifier.
   * @returns {Object|null} - The created workflow object if successful, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async delete(id) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/workflows/${id}`, {
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
   * "log" retrieves the workflow log for a given attempt.
   * @param {String} id - The workflow identifier.
   * @param {Integer} attempt - The attempt identifier.
   * @returns {Object|null} - The workflow log if found, otherwise throws an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  static async log(id, attempt) {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}/api/workflows/${id}/${attempt}/log`, {
        method: 'GET',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }


};
  