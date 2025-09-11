/*
 * Import libraries
 */
import React, { useContext, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { OverlayPanel } from 'primereact/overlaypanel';

import { APP_NAME, APP_VERSION } from '../constants';
import { userServices } from '../services/userServices';

/*
 * Components
 */
const AppHeader = () => {
  // Declare variables
  const history = useHistory();
  const op = useRef(null);
  const { auth, logout } = useContext(userServices);

  // Left menu
  const start = (
    <div className='flex align-items-center gap-2'>
      <img alt='logo' src='/logo512.png' height='40' className='mr-2' />
      <a href='/' className='p-menuitem-title'>
        <span className='p-menuitem-text'>{APP_NAME}</span>
      </a>
      <small className='mt-2'>{APP_VERSION}</small>
    </div>
  );

  // Right menu
  const end = (
    <ul className='p-menubar-root-list flex align-items-center gap-3'>
      <li className='p-menuitem-content'>
        <Link to='/help' className='p-menuitem'>Help</Link>
      </li>
      {auth ? (
        <>
          <Avatar
            shape='circle'
            icon='pi pi-user'
            style={{ cursor: 'pointer', backgroundColor: 'gray', color: 'white' }}
            onClick={(e) => op.current && op.current.toggle(e)}
          />
          <OverlayPanel ref={op}>
            <div className='menu-avatar flex flex-column gap-2 p-2 w-12rem'>
              <div className='mb-2 text-sm text-600'>
                Signed in as <strong>{auth.username}</strong>
              </div>
              <button
                className='p-link flex align-items-center gap-2 w-full'
                onClick={() => history.push(`/users/${auth.username}/view`)}
              >
                <i className='pi pi-user' /> Profile
              </button>
              <button
                className='p-link flex align-items-center gap-2 w-full'
                onClick={() => {
                  logout();
                  history.push('/');
                  op.current?.hide(); // close panel after logout
                }}
              >
                <i className='pi pi-sign-out' /> Logout
              </button>
            </div>
          </OverlayPanel>
        </>
      ) : (
        <Link to='/login' className='p-menuitem'><i className='pi pi-sign-in'/> Login</Link>
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