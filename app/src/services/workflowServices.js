/**
 * workflowServices is a class that defines the methods used to connect to the 'workflows' REST API
 */


// Import libraries/constants
import { BACKEND_URL } from '../constants';



export class workflowServices {

  // get token
  static getToken() {
    return localStorage.getItem('token');
  }

  // get the workflows
  static async get(id=null) {

    const token = this.getToken();
    if (!token) return null;

    try {
      let url = id ? `${BACKEND_URL}/api/workflows/${id}` : `${BACKEND_URL}/api/workflows`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  // create a workflow based on a pipeline
  static async create(data) {

    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/0`, {
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

  // launch a workflow
  static async edit(id, data) {

    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}`, {
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

  // launch a workflow
  static async launch(id, data) {

    const token = this.getToken();
    if (!token) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/launch`, {
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

  // get the workflow log for a given attempt
  static async log(id, attempt) {

    const token = this.getToken();
    if (!token) return null;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/${attempt}/log`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

};
  