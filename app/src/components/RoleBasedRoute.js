/*
 * Import libraries
 */

import React, {
  useEffect,
  useState,
  useContext
} from 'react';
import {
  Route,
  Redirect
} from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';

import { userServices } from '../services/userServices';

/*
 * Components
 */

const RoleBasedRoute = ({ component: Component, allowedRoles, ...rest }) => {

  // Declare variables
  const { auth, checkAuth } = useContext(userServices);
  const [loading, setLoading] = useState(true);

  // Perform actions outside the main scope
  // Verify the authentication
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth(); // ensure auth status is checked
      setLoading(false);
    };
    verifyAuth();
  }, [checkAuth]);
  
  if (loading) {
    return (
    <div className="flex justify-content-center flex-wrap">
      <ProgressSpinner />
    </div>
    );
  }

  return (
    <Route
      {...rest}
      render={props =>
        auth && allowedRoles.includes(auth.role) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default RoleBasedRoute;
