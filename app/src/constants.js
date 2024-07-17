/*
 * Declare the constants
*/


export const HOST_IP = process.env.HOST_IP || 'localhost';
export const BACKEND_BASE = `http://${HOST_IP}`;
export const BACKEND_PORT = process.env.PORT_APP || 3000;
export const BACKEND_URL = `${BACKEND_BASE}:${BACKEND_PORT}`;


export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;