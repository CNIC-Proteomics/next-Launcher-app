/*
 * Declare the constants
*/


export const BACKEND_HOST_IP = process.env.REACT_APP_HOST_IP || 'localhost';
export const BACKEND_PORT = process.env.REACT_APP_PORT_CORE || 8080;
export const BACKEND_URL = `http://${BACKEND_HOST_IP}:${BACKEND_PORT}`;


export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10Gb