/*
 * Workflow Services
 */


/*
 * Import libraries/constants
 */

import {
  BACKEND_URL, 
  // MAX_FILE_SIZE
} from '../constants';



/*
 * Define class
 */

export class workflowServices {

  // get the workflows
  static async get(id=null) {
    try {
      let url = id ? `${BACKEND_URL}/api/workflows/${id}` : `${BACKEND_URL}/api/workflows`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/0`, {
        method: 'POST',
        headers: {
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}`, {
        method: 'POST',
        headers: {
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/launch`, {
        method: 'POST',
        headers: {
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
    try {
      const response = await fetch(`${BACKEND_URL}/api/workflows/${id}/${attempt}/log`, {
        method: 'GET',
        headers: {
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
  