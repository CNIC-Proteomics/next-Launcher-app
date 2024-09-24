/*
 * Import libraries
 */

import React, {
  useState,
  useEffect
} from 'react';
import {
  Link,
  useLocation
} from 'react-router-dom';


/*
 * Components
 */

const NavigationTabs = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [{
    label: 'Main',
    icon: 'pi pi-home',
    to: '/'
  },{
    label: 'Datasets',
    icon: 'pi pi-database',
    to: '/datasets'
  },{
    label: 'Pipelines',
    icon: 'pi pi-sitemap',
    to: '/pipelines'
  },{
    label: 'Workflows',
    icon: 'pi pi-list',
    to: '/workflows'
  }];

  useEffect(() => {
      const pathToIndex = {
          '/': 0,
          '/datasets': 1,
          '/pipelines': 2,
          '/workflows': 3
      };
      setActiveIndex(pathToIndex[location.pathname]);
  }, [location]);

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
