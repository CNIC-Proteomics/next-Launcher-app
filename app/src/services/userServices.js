/**
 * userServices defines the methods used to connect to the 'users' REST API
 */


// Import libraries/constants
import React, {
  createContext,
  useState,
  useEffect,
  useCallback 
} from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  BACKEND_URL,
  CHECK_AUTH
} from '../constants';


/*
 * Components
 */

const userServices = createContext();

const AuthProvider = ({ children }) => {

  // Declare variables
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Chech the authentication
  // const checkAuth = () => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     const decodedToken = jwtDecode(token);
  //     if (decodedToken.exp * 1000 > Date.now()) {
  //       // save auth again
  //       setAuth({ token: token, username: decodedToken.username, role: decodedToken.role });
  //     } else {
  //       // token has expired
  //       localStorage.removeItem('token');
  //       setAuth(null);
  //     }
  //   } else {
  //     // token has expired
  //     localStorage.removeItem('token');
  //     setAuth(null);
  //   }
  // };
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 > Date.now()) {
        // save auth again
        setAuth({ token: token, username: decodedToken.username, role: decodedToken.role });
      } else {
        // token has expired
        localStorage.removeItem('token');
        setAuth(null);
      }
    } else {
      // token has expired
      localStorage.removeItem('token');
      setAuth(null);
    }
  }, []);

  // Perform actions outside the main scope
  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, CHECK_AUTH);
    return () => clearInterval(interval); // cleanup on unmount
  }, [checkAuth]);

  
  /**
   * "login" sets the authentication of the user.
   * @param {String} username - The username.
   * @param {String} password - The password.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   */
  const login = async (username, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // save tokens
      const decodedToken = jwtDecode(result.token);
      localStorage.setItem('token', result.token);
      
      // save variables
      setAuth({ token: result.token, username: decodedToken.username, role: decodedToken.role });
      setSuccess('Login successful');
      setError(null);

    } catch (error) { // handle error
      setError(error);
      setSuccess(null);
      console.error('Error:', error);
      throw error;
    }
  };

  /**
   * "register" sets the authentication of the user.
   * @param {String} username - The username.
   * @param {String} password - The password.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   */
  const register = async (username, password) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/0`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // save variables
      setSuccess(result);
      setError(null);

    } catch (error) { // handle error
      setError(error);
      setSuccess(null);
      console.error('Error:', error);
      throw error;
    }
  };

  /**
   * "logout" the user.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  return (
    <userServices.Provider value={{ auth, checkAuth, login, register, logout, error, success }}>
      {children}
    </userServices.Provider>
  );
};

export { userServices, AuthProvider };
