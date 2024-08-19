/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useContext
} from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
  showError,
} from '../services/toastServices';
import { userServices } from '../services/userServices';


/*
 * Components
 */

const User = () => {
  const [userData, setUserData] = useState(null);
  const { auth, info } = useContext(userServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (auth && auth.username) {
        try {
          const data = await info(auth.username);
          setLoading(false);
          setUserData(data);
        } catch (err) {
          showError('', `Error during login: ${err}`);
        }
      } else {
        showError('', 'User is not authenticated');
      }
    };

    fetchUserInfo();

  }, [auth, info]);

  return (
    <div className='user-info'>
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
      <Card title="User Information" style={{ width: '25rem', marginBottom: '2em' }}>
        <p><strong>ID:</strong> {userData._id}</p>
        <p><strong>Username:</strong> {userData.username}</p>
        <p><strong>Role:</strong> {userData.role}</p>
        <p><strong>Date Created:</strong> {new Date(userData.date_created).toLocaleString()}</p>
      </Card>
      )}
      </div>
  );
};

export default User;