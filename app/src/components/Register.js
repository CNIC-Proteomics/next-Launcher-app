/*
 * Import libraries
 */

import React, {
  useState,
  useContext
} from 'react';
import {
  useHistory 
} from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';

import {
  showError,
} from '../services/toastServices';
import { userServices } from '../services/userServices';


/*
 * Components
 */

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [empty, setEmpty] = useState({});
  // const [isLoggingIn, setIsLoggingIn] = useState(false); // state to prevent multiple logins
  const history = useHistory();

  const emptyValidation = () => {
    const newErrors = {};
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirmation password is required';
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };


  const { register, login } = useContext(userServices);

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    const validationEmpties = emptyValidation();
    if (Object.keys(validationEmpties).length > 0) {
        setEmpty(validationEmpties);
    } else {
      setEmpty({});
      // first register
      try {
        await register(username, password);
        // if everything was right, then login and redirect to "user" page
        try {
          await login(username, password);
          history.push(`/users/${username}/view`);
        } catch (err) {
          showError('', `Error during login: ${err}`);
          console.error('Error during login: ', err);
        }
      } catch (err) {
        showError('', `Error during registration: ${err}`);
        console.error('Error during registration: ', err);  
      }
    }
  };

  const header = <div className='font-bold mb-3'>Pick a password</div>;
  const footer = (
    <>
    <Divider />
    <p className='mt-2'>Suggestions</p>
    <ul className='pl-2 ml-2 mt-0 line-height-3'>
      <li>At least one lowercase</li>
      <li>At least one uppercase</li>
      <li>At least one numeric</li>
      <li>Minimum 8 characters</li>
    </ul>
    </>
  );
  
  return (
    <div className='register-content'>

      <div className='text-left mb-4'>
        <h2>Register a New User</h2>
        <p>Please fill in the details below to create a new account.</p>
      </div>

      <div className='w-full md:w-7 flex flex-column align-items-left gap-3 py-5 ml-3'>
        <div className='flex flex-wrap align-items-center gap-2'>
          {/* <label htmlFor='username'>Username</label> */}
          <InputText id='username' placeholder='Username' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />
          {empty.username && <Message severity='error' text='Username is required' />}
        </div>
        <div className='flex flex-wrap align-items-center gap-2'>
          {/* <label htmlFor='password'>Password</label> */}
          <Password id='password' type='password' placeholder='Password' value={password} header={header} footer={footer} onChange={(e) => setPassword(e.target.value)} toggleMask />
          {empty.password && <Message severity='error' text='Password is required' />}
        </div>
        <div className='flex flex-wrap align-items-center gap-2'>
          <Password id='confirmPassword' type='password' placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} toggleMask />
          {empty.confirmPassword && <Message severity='error' text={empty.confirmPassword} />}
        </div>
        <Button label='Sign In' icon='pi pi-user-plus' severity='success' className='w-10rem' onClick={handleRegister}></Button>
      </div>
  
    </div>
    
  );
};

export default Register;
