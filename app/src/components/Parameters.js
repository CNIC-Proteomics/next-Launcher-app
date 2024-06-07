/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  FileDatasetUpload,
  FolderDatasetUpload,
  StringDataset
} from './formDatasets';
import {
  // showInfo,
  showError,
  // showWarning
} from '../services/toastServices';
// import { datasetServices } from '../services/datasetServices';




/*
 * Components
 */


/* Create the Parameters panels */
const Parameters = (props) => {


  // Launch the pipeline creating a workflow instance
  // const [datasetId, setDatasetId] = useState({});
  const launchDataset = async (data) => {

    // convert the data pipeline to POST
    let dataPOST = {};
    try {
      dataPOST = {
        experiment: data
      };
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Processing the data for the POST request during dataset creation: ', error);
    }
    // make the POST request to create a workflow
    try {
      if ( Object.keys(dataPOST).length !== 0 && dataPOST.constructor === Object) {
        // const result = await datasetServices.create(dataPOST);
        const result = {_id: '66633eea16729f51f38e8e66'};
        if (result && result._id) {
          // setDatasetId(result);
        }
        else {  
          showError('', 'The dataset instance was not created correctly');
          console.error('The dataset id was not provided.');
        }
      }
    } catch (error) {
      showError('', 'Processing the data for the POST request during dataset creation');
      console.error('Error: making a POST request during dataset creation: ', error);
    }
  };

  // Create a Dataset instance provided that the workflow instance has been correctly initiated (indicating possession of the workflow ID)
  const createDatasetRef = useRef(false); // create flag variable to be sure the action runs only once on mount
  useEffect(() => {
    if (props.location.state.workflowId && !createDatasetRef.current) {
      launchDataset(props.location.state.workflowId)
      createDatasetRef.current = true;
    }
  }, [props.location.state.workflowId]);


  // Pipeline schema
  if ( props.location.state.schema ) {
    const schemaData = props.location.state.schema;
    return (
      <>
        <div className='parameters'>
          <div className="grid">
              <div className="col-3">
                <SideMenu definitions={schemaData.definitions} />
              </div>
              <div className="col-9">
                <div className="field">
                  <label htmlFor="workflow-description">Describe briefly your workflow:</label>
                  <InputText id="workflow-description" className="w-full" />
                </div>
                <Properties definitions={schemaData.definitions} />
              </div>
          </div>
        </div>
      </>
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

export default Parameters;

