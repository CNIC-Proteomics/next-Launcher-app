/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useMemo,
  // useRef
} from 'react';
import { useParams } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import {
  FileParameterUpload,
  FolderParameterUpload,
  StringParameter,
  DescriptionParameter
} from './formParameters';
import {
  showInfo,
  showWarning
} from '../services/toastServices';
import { workflowServices } from '../services/workflowServices';
// import { datasetServices } from '../services/datasetServices';




/*
 * Components
 */


/* Create the Parameters panels */
const Parameters = (props) => {

  // Capture datasetId from URL
  const { workflowId, datasetId } = useParams();
  // const [ workflowDescription, setWorkflowDescription ] = useState('');
  const [ postDataDesc ] = useState({});
  const [ postData ] = useState({});
  // const [postData, setPostData] = useState({});

  // 1. Lauch Workflow
  const launchWorkflow = async () => {

    let postData_Test = {
      "ReFrag results": {
          "name": "--re_files",
          "type": "directory-path",
          "value": "6667227e22cc1ec8df1e6c15/re_files/*"
      },
      "Experimental table": {
          "name": "--exp_table",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/exp_table.txt"
      },
      "Protein database": {
          "name": "--database",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/database.fasta"
      },
      "Decoy prefix": {
          "name": "--decoy_prefix",
          "type": "string",
          "value": "DECOY_"
      },
      "Parameter file": {
          "name": "--params_file",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/params_file.ini"
      },
      "Sitelist file": {
          "name": "--sitelist_file",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/sitelist_file.txt"
      },
      "Groupmaker file": {
          "name": "--groupmaker_file",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/groupmaker_file.txt"
      }
  };
  let postDataInputs = postData_Test;
  // let postDataInputs = postData;
  console.log(postDataDesc);
  console.log(postDataInputs);


    // Check that all parameters are filled in and that the files are uploaded
    let allValid = true;
    // Validate the description
    if ( Object.keys(postDataDesc).length === 0 ) {
      allValid = false;
      showWarning('',`Please fill in the 'Workflow description' field.`);
    }
    // Validate all input fields: the object has to be full (not empty)
    for (let key in postDataInputs) {
      if ( Object.keys(postDataInputs[key]).length === 0 ) {
        allValid = false;
        showWarning('',`Please fill in the '${key}' field.`);
      }
    }
    if (allValid) {
      // Prepare the POST data
      postDataInputs = { 'inputs': Object.values(postDataInputs) };

      // Launch process here
      // Edit the workflow with the description
      const result_edit = await workflowServices.edit(workflowId, postDataDesc);
      if (result_edit) {
        const result_launch = await workflowServices.launch(workflowId, postDataInputs);
        // const result_launch = { "status": 200, "message": "Workflow \"6667227e22cc1ec8df1e6c14\" was launched" }
        showInfo('', result_launch.message);
      }

    }

  };


  // Pipeline schema
  if ( props.location.state.schema ) {
    const schemaData = props.location.state.schema;
    return (
      <>
        <div className='parameters'>
          <div className="grid">
              <div className="col-3">
                <SideMenu definitions={schemaData.definitions} launchWorkflow={launchWorkflow} />
                {/* <SideMenu definitions={schemaData.definitions} /> */}
              </div>
              <div className="col-9">
                {/* <div className="field">
                  <label htmlFor="workflow-description">Describe briefly your workflow:</label>
                  <InputText id="workflow-description" className="w-full" value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)}/>
                </div> */}
                <DescriptionParameter
                  postData={postDataDesc}
                />
                <Properties
                  definitions={schemaData.definitions}
                  datasetId={datasetId}
                  postData={postData}
                />
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
const SideMenu = ({ definitions, launchWorkflow }) => {

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
        <Button label='Lauch' onClick={launchWorkflow} />
      </div>
    </div>
  );
};


/* Create the "Properties" of parameters */
const Properties = ({ definitions, datasetId, postData }) => {

  // create the panel header
  const header = (definition) => {
    return (
      <div className='parameter-panel-header'>
        <i className={definition.fa_icon} style={{fontSize:'1.25rem',marginRight:'0.5em'}}></i>{definition.title}
      </div>      
    );
  };

  // component for rendering input properties
  const Inputs = ({ propertyKey, property }) => {

    return (
    <>
      {(property.format === 'path' || property.format === 'directory-path') && (
        <FolderParameterUpload
          datasetId={datasetId}
          property={property}
          propertyFormat={property.format}
          propertyKey={propertyKey}
          postData={postData}
      />
      )}
      {property.format === 'file-path' && (
        <FileParameterUpload
          datasetId={datasetId}
          property={property}
          propertyFormat={property.format}
          propertyKey={propertyKey}
          postData={postData}
        />
      )}
      {property.format === 'string' && (
        <StringParameter
          datasetId={datasetId}
          property={property}
          propertyFormat={property.format}
          propertyKey={propertyKey}
          postData={postData}
        />
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
              <Inputs propertyKey={j} property={definitions[i].properties[j]} />
            </div>
          ))}
        </Panel>
      </div>
    ))}
    </>
  );
};

export default Parameters;

