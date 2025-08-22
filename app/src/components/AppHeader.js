/*
 * Import libraries
 */

import React, {
  useContext,
  useRef
} from 'react';
import {
  Link,
  useHistory 
} from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';

import {
  APP_NAME,
  APP_VERSION
} from '../constants';
import { userServices } from '../services/userServices';


/*
 * Components
 */

const AppHeader = () => {

  // Declare variables
  const history = useHistory ();
  const menuAvatar = useRef(null);
  const { auth, logout } = useContext(userServices);

  // Left menu
  const start = (
    <div className='flex align-items-center gap-2'>
      <img alt='logo' src='/logo512.png' height='40' className='mr-2'></img>
      <a href='/' className='p-menuitem-title'>
        <span className='p-menuitem-text'>{APP_NAME}</span>
      </a>
      <small className='mt-2'>{APP_VERSION}</small>
    </div>
  );

  // Right menu
  const avatarItems = auth ? [
    {
      label: (
        <div>
          <span className='font-normal'>Signed in as </span>{auth.username}
        </div>
      ),
      items: [{
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        command: () => history.push(`/users/${auth.username}/view`)
      },{
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: () => {
          logout();
          history.push('/'); // navigate to main page after logout
        }
      }]
    }
  ] : [];

  const end = (
    <ul className='p-menubar-root-list'>
      <li className='p-menuitem-content'>
        <Link to='/help' className='p-menuitem'>Help</Link>
      </li>
      {auth ? (
        <>
        <Avatar
          shape='circle'
          icon='pi pi-user'
          style={{ cursor: 'pointer', backgroundColor: 'gray', color: 'white' }}
          onClick={(event) => menuAvatar.current.toggle(event)}
        />
        <Menu
          className='menu-avatar'
          model={avatarItems}
          popup
          ref={menuAvatar}
        />
      </>
      ) : (
        <Link to='/login' icon='pi pi-sign-in' className='p-menuitem'>Login</Link>
      )}
    </ul>
  );

  return (
    <div className='app-header-container'>
      <Menubar start={start} end={end} />
    </div>
  )

};

export default AppHeader;