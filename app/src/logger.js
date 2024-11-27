import log from 'loglevel';

// Set the log level (optional)
log.setLevel('trace');

// Create an object to hold logged messages to avoid duplicates
const loggedMessages = new Set();

// Store log message
const logWithAuthor = (level, message, auth) => {
	// fallback to '' if auth or username is not provided
	const username = auth?.username || '';
	// create log message
	const timestamp = new Date().toISOString();
	const log_sms = `[${level.toUpperCase()}]:${username}: ${message}`;
	// check if the message has already been logged
	if (loggedMessages.has(log_sms)) {
		return; // don't log the message again if it's already been logged
	}
	// store the message in the cache
	log[level](`${timestamp} ${log_sms}`);
	loggedMessages.add(log_sms);
};

// Create component
const logger = {
	trace: (message, auth) => logWithAuthor('trace', message, auth),
	debug: (message, auth) => logWithAuthor('debug', message, auth),
	info: (message, auth) => logWithAuthor('info', message, auth),
	warn: (message, auth) => logWithAuthor('warn', message, auth),
	error: (message, auth) => logWithAuthor('error', message, auth),
	// Reset the logged messages (for testing or specific use cases)
	reset: () => loggedMessages.clear(),
};

export { logger };


// import { createLogger, format, transports } from 'winston';
// import BrowserConsole from 'winston-transport-browserconsole';

// // Define custom formats
// const { combine, timestamp, printf, colorize } = format;

// // Custom log format
// const logFormat = printf(({ level, message, timestamp }) => {
//   return `${timestamp} [${level}]: ${message}`;
// });

// // Create a logger instance
// const logger = createLogger({
//   level: 'info', // Default level for logging
//   format: combine(
//     timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     colorize(),
//     logFormat
//   ),
//   transports: [
//     new BrowserConsole({
//       level: 'debug', // Adjust the level as needed
//       format: combine(colorize(), logFormat),
//     }),
//   ],
// });

// export default logger;

// // src/utils/logger.js
// import { createLogger, transports, format } from 'winston';
// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp(),
//     format.printf(({ timestamp, level, message }) => {
//       return `${timestamp} [${level}]: ${message}`;
//     })
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'app.log' }) // Log to file
//   ]
// });

// import log4js from 'log4js';

// log4js.configure({
//   appenders: {
//     out: { type: 'console' },
//     app: { type: 'file', filename: 'app.log' },
//   },
//   categories: { default: { appenders: ['out', 'app'], level: 'debug' } },
// });

// const logger = log4js.getLogger();



// import log from 'loglevel';
// import { useContext } from 'react';
// import { userServices } from './services/userServices'; // Import the userServices context

// // Set the log level (optional: you can customize this as needed)
// log.setLevel('trace');

// // Custom logging function
// const logWithAuthor = (level, author, message) => {
//     const timestamp = new Date().toISOString();
//     log[level](`${timestamp} [${level.toUpperCase()}] [${author}]: ${message}`);
// };

// // Logger component that provides logging functionality
// const useLogger = () => {
//     const { auth } = useContext(userServices); // Access the auth context

//     const getUsername = () => auth?.username || 'Guest'; // Get username or default

//     return {
//         trace: (message) => logWithAuthor('trace', getUsername(), message),
//         debug: (message) => logWithAuthor('debug', getUsername(), message),
//         info: (message) => logWithAuthor('info', getUsername(), message),
//         warn: (message) => logWithAuthor('warn', getUsername(), message),
//         error: (message) => logWithAuthor('error', getUsername(), message),
//     };
// };

// export default useLogger; // Export the hook


// import log from 'loglevel';

// // Set the log level (optional: you can customize this as needed)
// log.setLevel('trace');

// // Custom logging function
// const logWithAuthor = (level, author, message) => {
//     const timestamp = new Date().toISOString();
//     log[level](`${timestamp} [${level.toUpperCase()}] [${author}]: ${message}`);
// };

// export const logger = {
//     trace: (auth, message) => logWithAuthor('trace', auth?.username || 'Guest', message),
//     debug: (auth, message) => logWithAuthor('debug', auth?.username || 'Guest', message),
//     info: (auth, message) => logWithAuthor('info', auth?.username || 'Guest', message),
//     warn: (auth, message) => logWithAuthor('warn', auth?.username || 'Guest', message),
//     error: (auth, message) => logWithAuthor('error', auth?.username || 'Guest', message),
// };

// export default logger;


// src/utils/logger.js

