/*
 * Import libraries
 */

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams,	useHistory } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';

import { showInfo, showWarning } from '../services/toastServices';
import { userServices } from '../services/userServices';
import { workflowServices } from '../services/workflowServices';
import { DescriptionParameter, DatasetExplorerDialog, StringParameter, BooleanParameter } from './Parameters';


  
  
  
/*
	* Components
	*/


/* Create the Pipeline panels */
const Pipeline = (data) => {


	// Declare context
	const { auth } = useContext(userServices);

	// Capture data from URL
	const { pipelineName } = useParams();


	// Declare states
	const [schemaData, setSchemaData] = useState(null);
	const [requiredFields, setRequiredFields] = useState(null);
	// const [ workflowId, setWorkflowId ] = useState(null);
	const [ postDescription ] = useState({});
	const [ postData, setPostData ] = useState({});
	const [ disabledLaunch, setDisabledLaunch ] = useState(true);
	const [ navigate, setNavigate ] = useState(false);
	const history = useHistory();


  // Fetch schema data (if not passed in state) and set it in state
  useEffect(() => {
    if (data.location.state?.schema) {
      setSchemaData(data.location.state.schema);
    }
  }, [data.location.state?.schema]);


  // Fetch required fields
  useEffect(() => {
    if (schemaData) {
			// let requiredFields = [];
			// Object.keys(schemaData.definitions).forEach((definitionKey) => {
			// 		const definition = schemaData.definitions[definitionKey];
			// 		if (definition.required) {
			// 			requiredFields.push(...definition.required);
			// 		}
			// });
			const getRequiredTitles = (schema) => {
				return Object.values(schema.definitions || {}).flatMap(def =>
					(def.required || []).map(req => def.properties[req]?.title)
				).filter(Boolean);
			};
			let requiredFields = getRequiredTitles(schemaData);
			// get unique values and remove 'outdir' element
			requiredFields = [...new Set(requiredFields)].filter((value) => value !== 'Output directory');
			setRequiredFields(requiredFields);	
    }
  }, [schemaData]);


	// Navigate to new page
	useEffect(() => {
		if (navigate) {
		history.push({
			pathname: `/workflows`,
		});
		}
	}, [navigate, history]);


	// Validate if all required fields are filled in the POST data
	useEffect(() => {
		if (requiredFields) {
				// check if all required fields are present and non-empty in postData
			const validateRequiredFields = (requiredFields, postData) => {
				return requiredFields.every((field) => postData[`--${field}`] && postData[`--${field}`] !== '');
			};		
			const allRequiredFieldsFilled = validateRequiredFields(requiredFields, postData);
			setDisabledLaunch(!allRequiredFieldsFilled);
			setDisabledLaunch(false); // FORCE the flag. It is a problem using the setPostData in the useEffect from Paramneters components
		}
	}, [requiredFields, postData, setDisabledLaunch]);


	// Lauch Pipeline
	const launchWorkflow = async () => {
    // Check that all parameters are filled in and that the files are uploaded
    let allValid = true;
    // Validate all workflow fields: the object has to be full (not empty)
		let key = 'Description';
		if ( !(key in postDescription) ) {
			allValid = false;
			showWarning('',`Please fill in the '${key}' field.`);
		}
    // Validate all input fields: the object has to be full (not empty)
    for (let key of requiredFields) {
			if ( !(key in postData) ) {
        allValid = false;
        showWarning('',`Please fill in the '${key}' field.`);
      }
    }
    // Launch process here
    if (allValid) {
			let dataPOST = {
				author: auth.username,
				profiles: auth.role,
				name: schemaData.title,
				pipeline: schemaData.url,
				revision: schemaData.revision,
				...Object.values(postDescription)[0]
			};
			const result_create = await workflowServices.create(dataPOST);
			if (result_create && result_create._id) {
				const workflowId = result_create._id;
				let inputsPOST = { 'inputs': Object.values(postData) };
				const result_launch = await workflowServices.launch(workflowId, inputsPOST);
				showInfo('', result_launch.message);
				setNavigate(true); // set state to trigger navigation	
			}
		}
	};


	// Render
	return (
		schemaData? (
			<>
			<div className='parameters'>
			<div className="grid">
				<div className="col-3">
					<SideMenu
						definitions={schemaData.definitions}
						launchWorkflow={launchWorkflow}
						disabledLaunch={disabledLaunch}
					/>
				</div>
				<div className="col-9">
					<DescriptionParameter
						title={pipelineName}
						postData={postDescription}
					/>
					<Properties
						definitions={schemaData.definitions}
						setPostData={setPostData}
						postData={postData}
					/>
				</div>
			</div>
			</div>
		</>
		): (<p>The pipeline schema is required</p>)
	);
};




/**
 * SideMenu
 * Creates the "Definitions" data from Pipeline
 */
const SideMenu = ({ definitions, launchWorkflow, disabledLaunch }) => {


	// Transform the data pipeline for the table
	const convertDefinitionsToMenu = (key, definition) => ({
		key: key,
		label: definition.title,
		// icon: definition.fa_icon,
		expanded: true,
		items: Object.entries(definition.properties).flatMap(([k, property]) => ({ key: k, label: property.title, expanded: true }))
	});

	const [menuItems] = useState( Object.entries(definitions).filter(([key, definition]) => key !== 'output_options').flatMap(([key, definition]) => convertDefinitionsToMenu(key, definition)) );


	// Get the keys that is going to be expanded
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
			<Button label='Lauch' disabled={disabledLaunch} onClick={launchWorkflow} />
		</div>
		</div>
	);

};




/**
 * Properties
 * Create the "Properties" of parameters
 */
const Properties = ({ definitions, setPostData, postData }) => {

	// Create the panel header
	const header = (definition) => {
		return (
		<div className='parameter-panel-header'>
			<i className={definition.fa_icon} style={{fontSize:'1.25rem',marginRight:'0.5em'}}></i>{definition.title}
		</div>      
		);
	};

	// Component for rendering input properties
	const Inputs = ({ pName, property }) => {
		return (
		<>
		{(property.format === 'path' || property.format === 'directory-path') && (
			<DatasetExplorerDialog
				pName={pName}
				property={property}
				postData={postData}
			/>
		)}
		{property.format === 'file-path' && (			
			<DatasetExplorerDialog
				pName={pName}
				property={property}
				postData={postData}
			/>
		)}
		{property.format === 'string' && (
			<StringParameter
				pName={pName}
				property={property}
				postData={postData}
			/>
		)}
		{property.format === 'boolean' && (
			<BooleanParameter
				pName={pName}
				property={property}
				postData={postData}
			/>
		)}
		</>
		);
	};

	// Render
	return (
		<>
		{ Object.keys(definitions).filter((i) => i !== 'output_options').map((i) => (
		<div key={i} className="field">
			<Panel header={header(definitions[i])}>
			{ Object.keys(definitions[i].properties).map((j) => (
				<div key={j} className="field mb-5">
					<Inputs pName={j} property={definitions[i].properties[j]} />
				</div>
			))}
			</Panel>
		</div>
		))}
		</>
	);
};





export default Pipeline;
