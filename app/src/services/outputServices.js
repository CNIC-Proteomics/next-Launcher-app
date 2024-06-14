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

export class outputServices {

  // get the outputs for a given workflow/attempt
  static async get(id, attempt) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/outputs/${id}/${attempt}`, {
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
  