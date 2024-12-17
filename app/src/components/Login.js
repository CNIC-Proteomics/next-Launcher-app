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
  GUEST_USER,
  GUEST_PWD
} from '../constants';
import {
  showError,
} from '../services/toastServices';
import { userServices } from '../services/userServices';


/*
 * Components
 */

const Login = () => {
  
  // Declare variables
  const { login } = useContext(userServices);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [empty, setEmpty] = useState({});
  const history = useHistory();

  // Check if fields are empty
  const emptyValidation = () => {
      const newErrors = {};
      if (!username) newErrors.username = 'Username is required';
      if (!password) newErrors.password = 'Password is required';
      return newErrors;
  };

  // Login user
  const handleLogin = async (e) => {
    e.preventDefault();
    const validationEmpties = emptyValidation();
    if (Object.keys(validationEmpties).length > 0) {
        setEmpty(validationEmpties);
    } else {
      try {
        setEmpty({});
        await login(username, password);
        history.push('/');
      } catch (err) {
        showError('', `${err}`);
      }
    }
  };

  // Login guest user
  const handleGuestLogin = async (e) => {
    e.preventDefault();
    try {
      await login(GUEST_USER, GUEST_PWD);
      history.push('/');
    } catch (err) {
      showError('', `${err}`);
    }
  };

  // Go to register page
  const goToRegister = () => {
    history.push('/register');
  };
    
  return (
    <div className='login-content'>
      <div className='flex flex-column md:flex-row'>
  
        <div className='w-full md:w-5 flex align-items-center justify-content-center py-5'>
          <Button
            label='Login as Guest'
            icon='pi pi-sign-in'
            severity='help'
            className='w-10rem'
            onClick={handleGuestLogin}
          />
        </div>

        <div className='w-full md:w-2'>
          <Divider layout='vertical' className='hidden md:flex'><b>OR</b></Divider>
          <Divider layout="horizontal" className="flex md:hidden" align="center"><b>OR</b></Divider>
        </div>
  
        <div className='w-full md:w-7 flex flex-column align-items-center gap-3 py-5'>
          <div className='flex flex-wrap align-items-center gap-2'>
            {/* <label htmlFor='username'>Username</label> */}
            <InputText
              id='username'
              placeholder='Username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {empty.username && <Message severity='error' text='Username is required' />}
          </div>
          <div className='flex flex-wrap align-items-center gap-2'>
            {/* <label htmlFor='password'>Password</label> */}
            <Password
              id='password'
              type='password'
              placeholder='Password'
              feedback={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
              toggleMask
            />
            {empty.password && <Message severity='error' text='Password is required' />}
          </div>
          <Button label='Login' icon='pi pi-user' className='w-10rem mx-auto' onClick={handleLogin}></Button>
        </div>
  
        <div className='w-full md:w-2'>
          <Divider layout='vertical' className='hidden md:flex'><b>OR</b></Divider>
          <Divider layout="horizontal" className="flex md:hidden" align="center"><b>OR</b></Divider>
        </div>
  
        <div className='w-full md:w-5 flex align-items-center justify-content-center py-5'>
          <Button label='Sign In' icon='pi pi-user-plus' severity='success' className='w-10rem' onClick={goToRegister}></Button>
        </div>

      </div>
    </div>
  );
};

export default Login;
