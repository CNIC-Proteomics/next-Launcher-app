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
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);

  // Chech the authentication
  const checkAuth = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      // check if token has expired
      if (decodedToken.exp * 1000 > Date.now()) { // not expired
        const newAuth = { token: token, username: decodedToken.username, role: decodedToken.role };
        // update state only if the auth object has changed
        if (JSON.stringify(auth) !== JSON.stringify(newAuth)) {
          setAuth(newAuth);
        }
      } else { // token has expired
        sessionStorage.removeItem('token');
        setAuth(null);
      }
    } else { // token has expired
      sessionStorage.removeItem('token');
      setAuth(null);
    }
  }, [auth]);

  // Perform actions outside the main scope
  useEffect(() => {
    checkAuth(); // check auth when the component is mounted
    const interval = setInterval(checkAuth, CHECK_AUTH); // periodically check auth status
    return () => clearInterval(interval); // cleanup on unmount
  }, [checkAuth]);


  /**
   * "login" sets the authentication of the user.
   * @param {String} username - The username.
   * @param {String} password - The password.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
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
        let error = `${response.status}:${response.statusText}`;
        throw new Error(`Login failed: ${error}`);
      }
      const result = await response.json();

      try {
        // save token
        const decodedToken = jwtDecode(result.token);
        sessionStorage.setItem('token', result.token);
        setAuth({ token: result.token, username: decodedToken.username, role: decodedToken.role });

      } catch (err) {
        throw new Error(`Token processing failed: ${err.message}`);
      }

      // return response
      // return result;

    } catch (error) { // handle error
      console.error(error);
      throw new Error(error.message);
    }
  };


  /**
   * "register" sets the authentication of the user.
   * @param {String} username - The username.
   * @param {String} password - The password.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
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
        let error = `${response.status}:${response.statusText}`;
        throw new Error(`Register failed: ${error}`);
      }
      // const result = await response.json();

    } catch (error) { // handle error
      console.error(error);
      throw new Error(error.message);
    }
  };


  /**
   * "info" gets the user information.
   * @param {String} username - The username.
   * @returns {Object|null} - If the indicated object is found, otherwise throw an error.
   * @throws {Error} - Throws an error if the request is not successful.
   */
  const info = async (username) => {
    // retrieve token directly
    const token = sessionStorage.getItem('token');
    if (!token) return null;  

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${username}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        let error = `${response.status}:${response.statusText}`;
        throw new Error(`User info failed: ${error}`);
      }
      const result = await response.json();

      return result; // return response

    } catch (error) { // handle error
      console.error(error);
      throw new Error(error.message);
    }
  };

  /**
   * "logout" clears all values in session storage and removes the authentication variable.
   */
  const logout = () => {
    sessionStorage.clear();
    setAuth(null);
  };

  return (
    // <userServices.Provider value={{ auth, checkAuth, login, register, info, logout, error, success }}>
    <userServices.Provider value={{ auth, checkAuth, login, register, info, logout }}>
      {children}
    </userServices.Provider>
  );
};

export { userServices, AuthProvider };
