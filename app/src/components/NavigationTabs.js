/*
 * Import libraries
 */

import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { userServices } from '../services/userServices';


/*
 * Components
 */

const NavigationTabs = () => {
  // Declare context
	const { auth } = useContext(userServices);

  // Declare states
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoize the items array to avoid it being re-created on every render
  const items = useMemo(() => [
    {
      label: 'Main',
      icon: 'pi pi-home',
      to: '/',
    },
    {
      label: 'Datasets',
      icon: 'pi pi-database',
      to: '/datasets',
    },
    {
      label: 'Pipelines',
      icon: 'pi pi-sitemap',
      to: '/pipelines',
    },
    {
      label: 'Workflows',
      icon: 'pi pi-list',
      to: '/workflows',
    },
    // include only for admin
    ...(auth?.role === 'admin' ? [{
      label: 'Users',
      icon: 'pi pi-users',
      to: '/users',
    }] : []),
  ], [auth]);

  useEffect(() => {
    // Match the active tab based on the current path prefix. Ensure 'Main' is only selected for the exact '/'
    const index = items.findIndex((item, idx) => idx === 0 ? location.pathname === item.to : location.pathname.startsWith(item.to) );
    setActiveIndex(index !== -1 ? index : 0); // Default to 0 if no match
  }, [location, items]);

  return (
      <div className="header">
        <TabMenuWithLink items={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
      </div>
  );
};

const TabMenuWithLink = ({ items, activeIndex, onTabChange }) => {
  return (
      <div className="p-tabmenu p-component">
          <ul className="p-tabmenu-nav p-reset" role="tablist">
              {items.map((item, index) => (
                  <li key={index} className={`p-tabmenuitem ${index === activeIndex ? 'p-highlight' : ''}`} onClick={() => onTabChange({ index })}>
                      <Link to={item.to} className="p-menuitem-link">
                          <span className={`p-menuitem-icon ${item.icon}`}></span>
                          <span className="p-menuitem-text">{item.label}</span>
                      </Link>
                  </li>
              ))}
          </ul>
      </div>
  );
};

export default NavigationTabs;
