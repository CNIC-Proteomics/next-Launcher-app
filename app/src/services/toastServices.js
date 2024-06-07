/*
 * Import libraries
 */

import { createRef } from 'react';
import { Toast } from 'primereact/toast';


/*
 * Components
 */


// Create a ref for the Toast component
const toastRef = createRef();

// Function to display a toast message
const showToast = (severity, summary, detail, options = {}) => {
  if (toastRef.current) {
    toastRef.current.show({ severity, summary, detail, ...options});
  } else {
    console.error("Toast component is not mounted yet.");
  }
};

// Wrapper functions for different types of messages
const showInfo = (summary, detail) => showToast('info', summary, detail, {life: 3000});
const showError = (summary, detail) => showToast('error', summary, detail, {sticky: true});
const showWarning = (summary, detail) => showToast('warn', summary, detail, {life: 3000});

// Create component
const AppToaster = () => {
  return (<Toast className='app-toaster' ref={toastRef} />);
};

// Export the ref and the functions
export { AppToaster, toastRef, showInfo, showError, showWarning };
