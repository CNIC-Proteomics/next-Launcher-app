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
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import {
  FileDatasetUpload,
  FolderDatasetUpload,
  StringDataset
} from './formDatasets';
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
  const [ workflowDescription, setWorkflowDescription ] = useState('');
  const [ postData ] = useState({});

  // const handlePostData = (newPostData) => {
  //   setPostData(newPostData);
  // };


  // 1. Lauch Workflow
  const launchWorkflow = async () => {

    let postData_2 = {
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
          "value": "6667227e22cc1ec8df1e6c15/params.ini"
      },
      "Sitelist file": {
          "name": "--sitelist_file",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/sitelist.txt"
      },
      "Groupmaker file": {
          "name": "--groupmaker_file",
          "type": "file-path",
          "value": "6667227e22cc1ec8df1e6c15/groupmaker.txt"
      }
  };
  console.log(postData_2);



    // bash workflow/launch.sh http://localhost:8080 66447ecf309b2cffc914ac88 \
    // '{"inputs": [
    //     {"name": "--re_files", "type": "directory-path", "value": "6667227e22cc1ec8df1e6c15/re_files/*"},
    //     {"name": "--exp_table", "type": "file-path", "value": "6667227e22cc1ec8df1e6c15/exp_table.txt"},
    //     {"name": "--database", "type": "file-path", "value": "6667227e22cc1ec8df1e6c15/database.fasta"},
    //     {"name": "--decoy_prefix", "type": "string", "value": "DECOY_"},
    //     {"name": "--params_file", "type": "file-path", "value": "6667227e22cc1ec8df1e6c15/params.ini"},
    //     {"name": "--sitelist_file", "type": "file-path", "value": "6667227e22cc1ec8df1e6c15/sitelist.txt"},
    //     {"name": "--groupmaker_file", "type": "file-path", "value": "6667227e22cc1ec8df1e6c15/groupmaker.txt"}
    // ]
    // }'

    // bash workflow/edit.sh http://localhost:8080 66447ecf309b2cffc914ac88 \
    // '{"pipeline": "https://github.com/CNIC-Proteomics/nf-PTM-compass",
    // "revision": "main",
    // "profiles": "guess",
    // "description": "test 2 workflow"
    // }'

    // Check that all parameters are filled in and that the files are uploaded
    let allValid = true;
    // Validate the description
    if ( workflowDescription === '' ) {
      allValid = false;
      showWarning('',`Please fill in the 'Workflow description' field.`);
    }
    // Validate all input fields: the object has to be full (not empty)
    for (let key in postData_2) {
      if ( Object.keys(postData_2[key]).length === 0 ) {
        allValid = false;
        showWarning('',`Please fill in the '${key}' field.`);
      }
    }
    if (allValid) {
      // Prepare the POST data
      let postData_desc = {
        'description': workflowDescription
      };
      postData_2 = { 'inputs': Object.values(postData_2) };
      console.log(postData_2);

      // Launch process here
      // Edit the workflow with the description
      const result_edit = await workflowServices.edit(workflowId, postData_desc);
      if (result_edit) {
        // const result_launch = await workflowServices.launch(workflowId, postData_2);
        const result_launch = { "status": 200, "message": "Workflow \"6667227e22cc1ec8df1e6c14\" was launched" }
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
                <div className="field">
                  <label htmlFor="workflow-description">Describe briefly your workflow:</label>
                  <InputText id="workflow-description" className="w-full" value={workflowDescription} onChange={(e) => setWorkflowDescription(e.target.value)}/>
                </div>
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
        <FolderDatasetUpload
          datasetId={datasetId}
          property={property}
          propertyFormat={property.format}
          propertyKey={propertyKey}
          postData={postData}
      />
      )}
      {property.format === 'file-path' && (
        <FileDatasetUpload
          datasetId={datasetId}
          property={property}
          propertyFormat={property.format}
          propertyKey={propertyKey}
          postData={postData}
        />
      )}
      {property.format === 'string' && (
        <StringDataset
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

