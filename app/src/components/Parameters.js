/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useMemo,
  // useRef
} from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  // FileListDatasetUpload,
  FolderDatasetUpload,
  FileDatasetUpload,
  StringDataset
} from './formDatasets';
// import {
//   // showInfo,
//   showError,
//   // showWarning
// } from '../services/toastServices';



/*
 * Functions
 */


/* Create the Parameters panels */
const Parameters = (props) => {

  // // Check if workflow ID exist
  // if ( props.location.state.workflowId ) {
  //   showError('Error Message', 'This is an error message');
  // }

  // Pipeline schema
  if ( props.location.state.schema ) {
    const schemaData = props.location.state.schema;
    return (
      <div className='parameters'>
        <div className="grid">
            <div className="col-3">
              <SideMenu definitions={schemaData.definitions} />
            </div>
            <div className="col-9">
              <div className="field">
                <label htmlFor="username">Describe briefly your workflow:</label>
                <InputText id="username" className="w-full" aria-describedby="username-help" />
                {/* <small id="username-help">Enter your username to reset your password.</small> */}
              </div>
              <Properties definitions={schemaData.definitions} />
              {/* <FileListUpload /> */}
            </div>
        </div>
      </div>
    );
  }
  // The component has not received the pipeline schema
  else {
    return (
      <>
        <p>The pipeline schema is required</p>
      </>
    );
  }
};


/* SideMenu created by "Definitions" data from Pipeline */
const SideMenu = ({ definitions }) => {

  // Transform the data pipeline for the table
  const convertDefinitionsToMenu = (key, definition) => ({
    key: key,
    label: definition.title,
    // icon: definition.fa_icon,
    expanded: true,
    items: Object.entries(definition.properties).flatMap(([k, property]) => ({ key: k, label: property.title, expanded: true }))
  });

  const [menuItems] = useState( Object.entries(definitions).filter(([key, definition]) => key !== 'output_options').flatMap(([key, definition]) => convertDefinitionsToMenu(key, definition)) );

  // get the keys that is going to be expanded
  const getExpandedKeys = useMemo(() => (items) => {
    const keys = {};
    items.forEach((item, index) => {
      let k = item.key;
      if (item.expanded) { keys[k] = true; }
      if (item.items) { Object.assign(keys, getExpandedKeys(item.items, k)); }
    });
    return keys;
  }, []);
  
  const [expandedKeys, setExpandedKeys] = useState({});
  useEffect(() => {
      const keys = getExpandedKeys(menuItems);
      setExpandedKeys(keys);
  }, [getExpandedKeys, menuItems]);

  return (
    <div className='parameters-sidemenu'>
      <div className='flex flex-column gap-4'>
        <PanelMenu model={menuItems} expandedKeys={expandedKeys} multiple />
        <Button label='Lauch' />
      </div>
    </div>
  );
};


/* Create the "Properties" of parameters */
const Properties = ({ definitions }) => {

  // create the panel header
  const header = (definition) => {
    return (
      <div className='parameter-panel-header'>
        <i className={definition.fa_icon} style={{fontSize:'1.25rem',marginRight:'0.5em'}}></i>{definition.title}
      </div>      
    );
  };

  // component for rendering input properties
  const Inputs = ({ properties }) => {
    return (
    <>
      {(properties.format === 'path' || properties.format === 'directory-path') && (
        <FolderDatasetUpload properties={properties} />
      )}
      {properties.format === 'file-path' && (
        <FileDatasetUpload properties={properties} />
      )}
      {properties.format === 'string' && (
        <StringDataset properties={properties} />
      )}
    </>
    );
  };

  return (
    <>
    { Object.keys(definitions).filter((i) => i !== 'output_options').map((i) => (
      <div key={i} className="field">
        <Panel header={header(definitions[i])}>
          { Object.keys(definitions[i].properties).map((j) => (
            <div key={j} className="field mb-5">
              <Inputs properties={definitions[i].properties[j]} />
            </div>
          ))}
        </Panel>
      </div>
    ))}
    </>
  );
};


// /* Component for rendering file list */
// const FileListUpload = () => {

//   // create the panel header
//   const header = (
//       <div className='parameter-panel-header'>
//         <i className='pi pi-file-export' style={{fontSize:'1.25rem',marginRight:'0.5em'}}></i>Upload the file list
//       </div>      
//     );

//   return (
//     <div className="field">
//       <Panel header={header}>
//           <FileListDatasetUpload />
//       </Panel>
//     </div>
//   );
// };

export default Parameters;
