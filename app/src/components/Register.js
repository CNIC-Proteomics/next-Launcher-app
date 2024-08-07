import React, {
  useState,
  useContext
} from 'react';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';

import { userServices } from '../services/userServices';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [empty, setEmpty] = useState({});

  const emptyValidation = () => {
      const newErrors = {};
      if (!username) newErrors.username = 'Username is required';
      if (!password) newErrors.password = 'Password is required';
      return newErrors;
  };

  const { register } = useContext(userServices);

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationEmpties = emptyValidation();
    if (Object.keys(validationEmpties).length > 0) {
        setEmpty(validationEmpties);
    } else {
      setEmpty({});
      await register(username, password);
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

      <div className='w-full md:w-7 flex flex-column align-items-center gap-3 py-5'>
        <div className='flex flex-wrap align-items-center gap-2'>
          {/* <label htmlFor='username'>Username</label> */}
          <InputText id='username' placeholder='Username' type='text' className='w-14rem' value={username} onChange={(e) => setUsername(e.target.value)} />
          {empty.username && <Message severity='error' text='Username is required' />}
        </div>
        <div className='flex flex-wrap align-items-center gap-2'>
          {/* <label htmlFor='password'>Password</label> */}
          <Password id='password' type='password' placeholder='Password' className='w-14rem' value={password} header={header} footer={footer} onChange={(e) => setPassword(e.target.value)} toggleMask />
          {empty.password && <Message severity='error' text='Password is required' />}
        </div>
        <Button label='Sign In' icon='pi pi-user-plus' severity='success' className='w-10rem' onClick={handleRegister}></Button>
      </div>
  
    </div>
  );
};

export default Register;
