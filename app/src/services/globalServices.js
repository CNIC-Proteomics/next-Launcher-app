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


/**
 * Function to get an attempt input by Name from a given attempt.
 * @param {Object} attempt - The object that defines an attempt.
 * @param {String} name - The Name of the input to find.
 * @returns {Object|null} - The input object if found, otherwise null.
 */
export const getAttemptInputByName = (attempt, name) => {
	if ( 'inputs' in attempt && isNotEmptyObject(attempt.inputs) ) {
		return attempt.inputs.find(input => String(input.name) === String(name)) || null;
	}
	else { return null }
};


/**
 * Utility function to get file name from a path or URL
 * @param {String} path - Path from a file
 * @returns {String} - The base name of file.
 */
export const getFileName = (path) => {
  return path.split('/').pop();
};


/**
 * Utility function to get basename from a path or URL
 * @param {String} path - Path from a file
 * @returns {String} - The base name of file.
 */
export const getBaseName = (path) => {
  const nameWithExtension = path.split('/').pop();
  return nameWithExtension.split('.').slice(0, -1).join('.');
};


/**
 * Utility function to format a file size into human-readable units (B, KB, MB, GB, etc.)
 * @param {Number} sizeInBytes - File size in bytes
 * @returns {String} - Formatted file size with two decimal points and the appropriate unit (B, KB, MB, GB, etc.)
 */
export const formatFileSize = (sizeInBytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;

    // Convert the file size to the appropriate unit
    while (sizeInBytes >= 1024 && index < units.length - 1) {
        sizeInBytes /= 1024;
        index++;
    }

    // Return the formatted file size with two decimal precision and the unit
    return `${sizeInBytes.toFixed(2)} ${units[index]}`;
};


/**
 * Utility function to convert a timestamp into a human-readable date and time.
 * @param {Number|String} timestamp - The timestamp to be converted (in milliseconds or a valid date string).
 * @returns {String} - Formatted date and time in the format "dd/mm/yyyy hh:mm:ss".
 */
export const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';
  // convert the timestamp to a Date object
  const date = new Date(timestamp);
  // get the day, month, and year from the Date object
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // format the date as dd/mm/yyyy hh:mm:ss
  const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;  
  return formattedDateTime;
};
