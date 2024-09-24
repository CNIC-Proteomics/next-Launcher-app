/*
 * Declare the constants
*/

/* App constants */
export const APP_NAME = process.env.REACT_APP_NAME;
export const APP_VERSION = process.env.REACT_APP_VERSION;

/* Server constants */
export const BACKEND_HOST_IP = process.env.REACT_APP_HOST_IP || 'localhost';
export const BACKEND_PORT = process.env.REACT_APP_PORT_CORE || 8080;
export const BACKEND_URL = `http://${BACKEND_HOST_IP}:${BACKEND_PORT}`;

/* Intervals file constants */
export const CHECK_AUTH = 60000; // check every 60 seconds
export const CHECK_WORKFLOWS = 10000; // check every 10 seconds

/* Upload file constants */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10Gb

/* User constants */
export const GUEST_USER = 'guest';
export const GUEST_PWD = 'guest';

