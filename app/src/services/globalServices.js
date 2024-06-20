/**
 * Define global functions
 */


// Import libraries/constants




/**
 * Function to check if a value is an object and not an empty object.
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is an object and not empty, false otherwise.
 */
export const isNotEmptyObject = (value) => {
	return value && typeof value === 'object' && Object.keys(value).length > 0;
};


/**
 * Function to get an attempt by ID from the attempts array.
 * @param {Object} workflow - The object that defines an workflow.
 * @param {number} id - The ID of the attempt to find.
 * @returns {Object|null} - The attempt object if found, otherwise null.
 */
export const getAttemptById = (workflow, id) => {
	if ( 'attempts' in workflow && isNotEmptyObject(workflow.attempts) ) {
		return workflow.attempts.find(attempt => String(attempt.id) === String(id)) || null;
	}
	else { return null }
};


// Utility function to get basename from a path or URL
/**
 * Utility function to get basename from a path or URL
 * @param {String} path - Path from a file
 * @returns {String} - The base name of file.
 */
export const getBasename = (path) => {
  return path.split('/').pop();
};
  