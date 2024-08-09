/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  useParams,
  useHistory
} from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';

import {
  showInfo,
  showWarning
} from '../services/toastServices';
import {
  DescriptionParameter,
  FileParameterUpload,
  FolderParameterUpload,
  StringParameter,
  BooleanParameter
} from './formParameters';
import { workflowServices } from '../services/workflowServices';




/*
 * Components
 */


/* Create the Parameters panels */
const Parameters = (data) => {

  // Capture data from URL
  // const { workflowId, attemptId, datasetId } = useParams();
  const { workflowId, datasetId } = useParams();
  const [ postWorkflowData ] = useState({});
  const [ postData ] = useState({});
  const history = useHistory();
  const [navigate, setNavigate] = useState(false);

  // Navigate to new page
  // useEffect(() => {
  //   if (navigate) {
  //     let newAttempt = Number(attemptId) + 1;
  //     history.push({
  //       pathname: `/workflows/${workflowId}/${newAttempt}`,
  //       pathname: `/workflows`,
  //     });
  //   }
  // }, [navigate, history, workflowId, attemptId]);
  useEffect(() => {
    if (navigate) {
      history.push({
        pathname: `/workflows`,
      });
    }
  }, [navigate, history]);

  // 1. Lauch Workflow
  const launchWorkflow = async () => {

    // let postData_Test = {
    //   "ReFrag results": {
    //       "name": "--re_files",
    //       "type": "directory-path",
    //       "value": "666ac7dede575bad9e78a83b/re_files/*"
    //   },
    //   "Experimental table": {
    //       "name": "--exp_table",
    //       "type": "file-path",
    //       "value": "666ac7dede575bad9e78a83b/exp_table.txt"
    //   },
    //   "Protein database": {
    //       "name": "--database",
    //       "type": "file-path",
    //       "value": "666ac7dede575bad9e78a83b/database.fasta"
    //   },
    //   "Decoy prefix": {
    //       "name": "--decoy_prefix",
    //       "type": "string",
    //       "value": "DECOY_"
    //   },
    //   "Parameter file": {
    //       "name": "--params_file",
    //       "type": "file-path",
    //       "value": "666ac7dede575bad9e78a83b/params_file.ini"
    //   },
    //   "Sitelist file": {
    //       "name": "--sitelist_file",
    //       "type": "file-path",
    //       "value": "666ac7dede575bad9e78a83b/sitelist_file.txt"
    //   },
    //   "Groupmaker file": {
    //       "name": "--groupmaker_file",
    //       "type": "file-path",
    //       "value": "666ac7dede575bad9e78a83b/groupmaker_file.txt"
    //   }
    // };

  //   let postData_Test = {
  //     "MS data": {
  //       "name": "--raw_files",
  //       "type": "directory-path",
  //       "value": "667996c52ddebdab5fdc8a31/raw_files/*"
  //   },
  //   "Protein database": {
  //       "name": "--database",
  //       "type": "file-path",
  //       "value": "667996c52ddebdab5fdc8a31/database.fasta"
  //   },
  //   "Add decoys": {
  //       "name": "--add_decoys",
  //       "type": "boolean",
  //       "value": "true"
  //   },
  //   "Decoy prefix": {
  //       "name": "--decoy_prefix",
  //       "type": "string",
  //       "value": "DECOY_"
  //   },
  //   "MSFragger parameter file": {
  //       "name": "--msf_params_file",
  //       "type": "file-path",
  //       "value": "667996c52ddebdab5fdc8a31/msf_params_file.params"
  //   },
  //   "Ion isotopic reporter file": {
  //       "name": "--reporter_ion_isotopic",
  //       "type": "file-path",
  //       "value": "667996c52ddebdab5fdc8a31/reporter_ion_isotopic.tsv"
  //   }
  // };
  // let postInputsData = postData_Test;
  
  let postInputsData = postData;
  // console.log(postWorkflowData);
  // console.log(postInputsData);


    // Check that all parameters are filled in and that the files are uploaded
    let allValid = true;
    // Validate all workflow fields: the object has to be full (not empty)
    for (let key in postWorkflowData) {
      if ( Object.keys(postWorkflowData[key]).length === 0 ) {
        allValid = false;
        showWarning('',`Please fill in the '${key}' field.`);
      }
    }
    // Validate all input fields: the object has to be full (not empty)
    for (let key in postInputsData) {
      if ( Object.keys(postInputsData[key]).length === 0 ) {
        allValid = false;
        showWarning('',`Please fill in the '${key}' field.`);
      }
    }

    // Launch process here
    if (allValid) {
      // Prepare the POST data
      postInputsData = { 'inputs': Object.values(postInputsData) };

      // Edit the workflow with the description
      const result_edit = await workflowServices.edit(workflowId, postWorkflowData);
      if (result_edit) {
        const result_launch = await workflowServices.launch(workflowId, postInputsData);
        showInfo('', result_launch.message);
        setNavigate(true); // set state to trigger navigation
      }
    }
  };


  // Pipeline schema
  if ( data.location.state.schema ) {
    const schemaData = data.location.state.schema;
    const schemaTitle = schemaData.title;  
    return (
      <>
        <div className='parameters'>
          <div className="grid">
              <div className="col-3">
                <SideMenu definitions={schemaData.definitions} launchWorkflow={launchWorkflow} />
              </div>
              <div className="col-9">
                <DescriptionParameter
                  title={schemaTitle}
                  postData={postWorkflowData}
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
      {property.format === 'boolean' && (
        <BooleanParameter
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

