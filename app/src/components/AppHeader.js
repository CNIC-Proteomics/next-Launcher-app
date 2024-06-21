/*
 * Import libraries
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';


/*
 * Components
 */

const AppHeader = () => {

  const start = (
    <div className="flex align-items-center gap-2">
      <img alt="logo" src='logo512.png' height="40" className="mr-2"></img>
      <a href="/" className="p-menuitem-title">
        <span className="p-menuitem-text">next-Launcher</span>
      </a>
    </div>
  );

  const end = (
  <>
    <ul className='p-menubar-root-list'>
      <li className='p-menuitem-content'>
        <Link to="/pipelines" className="p-menuitem">Pipelines</Link>
      </li>
      <li className='p-menuitem-content'>
        <Link to="/workflows" className="p-menuitem">Workflows</Link>
      </li>
      <li className='p-menuitem-content'>
        <Link to="/datasets" className="p-menuitem">Datasets</Link>
      </li>
      <li className='p-menuitem-content'>
        <Link to="/help" className="p-menuitem">Help</Link>
      </li>
    </ul>
  </>
  );

  return (
    <div className='app-header-container'>
      <Menubar start={start} end={end} />
    </div>
  )

};

export default AppHeader;