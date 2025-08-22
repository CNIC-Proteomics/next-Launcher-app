/*
 * Import libraries
 */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import { ALLOWED_ROLES } from '../constants';
import { showError, showInfo } from '../services/toastServices';
import { userServices } from '../services/userServices';

/*
 * Components
 */

const User = () => {
  const { id: routeId, operation: routeOperation } = useParams();
  const id = routeId;
  const operation = routeOperation;
  const history = useHistory();

  const { auth, get, edit } = useContext(userServices);

  const [userData, setUserData] = useState({
    _id: '',
    username: '',
    role: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasUserData = useRef(false);

  // Initial fetch
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await get(id);
        if (data) {
          setUserData({
            _id: data._id,
            username: data.username,
            role: data.role,
            password: ''
          });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        showError('', `Error fetching user data: ${err}`);
      }
    };

    if (id && !hasUserData.current) {
      fetchUserInfo();
      hasUserData.current = true;
    }
  }, [id, get]);

  // Update user info
  const updateUser = async () => {
    setIsProcessing(true);
    try {
      const updatePayload = {
        username: userData.username,
        role: userData.role
      };
      if (userData.password && userData.password.trim() !== '') {
        updatePayload.password = userData.password;
      }
      await edit(userData.username, updatePayload);
      showInfo('', 'User updated successfully');
      history.push('/users'); // redirect to users list
    } catch (err) {
      showError('', `Error updating user: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render
  return (
    <div className="user-info">
      {loading ? (
        <div className="flex justify-content-center flex-wrap">
          <ProgressSpinner />
        </div>
      ) : (
        operation === 'view' ? (
          <UserView userData={userData} />
        ) : operation === 'update' ? (
          <UserUpdate
            auth={auth}
            userData={userData}
            setUserData={setUserData}
            updateUser={updateUser}
            isProcessing={isProcessing}
          />
        ) : <></>
      )}
    </div>
  );
};

/*
 * UserView Component
 */
const UserView = ({ userData }) => (
  <Card title="User Information" style={{ width: '25rem', marginBottom: '2em' }}>
    <p><strong>ID:</strong> {userData._id}</p>
    <p><strong>Username:</strong> {userData.username}</p>
    <p><strong>Role:</strong> {userData.role}</p>
  </Card>
);

/*
 * UserUpdate Component
 */
const UserUpdate = ({ auth, userData, setUserData, updateUser, isProcessing }) => {

  // adapt allowed roles
  const roles = ALLOWED_ROLES.map(role => ({
    label: role,
    value: role
  }));

  const onChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card title="Update User" style={{ width: '30rem', marginBottom: '2em' }}>
      <div className="field">
        <label>Username</label>
        <InputText
          value={userData.username}
          onChange={(e) => onChange('username', e.target.value)}
          className="w-full"
        />
      </div>
      <div className="field">
        <label>Password (leave blank to keep unchanged)</label>
        <InputText
          type="password"
          value={userData.password}
          onChange={(e) => onChange('password', e.target.value)}
          className="w-full"
        />
      </div>
      <div className="field">
        <label>Role</label>
        {auth.role === 'admin' ? (
          <Dropdown
            value={userData.role}
            options={roles}
            onChange={(e) => onChange('role', e.value)}
            placeholder="Select a role"
            className="w-full"
          />
        ) : (
          <InputText value={userData.role} disabled className="w-full" />
        )}
      </div>
      <div className="field flex justify-content-center mt-3">
        <Button
          label="Update"
          onClick={updateUser}
          disabled={isProcessing}
        />
      </div>
    </Card>
  );
};


export default User;