/*
 * Import libraries
 */

import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useParams,	useHistory } from 'react-router-dom';
import { PanelMenu } from 'primereact/panelmenu';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

import { PIPELINES_LIST } from '../constants';
import { showInfo, showWarning, showError } from '../services/toastServices';
import { userServices } from '../services/userServices';
import { workflowServices } from '../services/workflowServices';
import * as globalServices from '../services/globalServices';
import { DescriptionParameter, DatasetExplorerDialog, StringParameter, BooleanParameter } from './Parameters';


  
  
  
/*
	* Components
	*/


/* Create the Pipeline panels */
const Pipeline = () => {


	// Declare context
	const { auth } = useContext(userServices);

	// Capture all possible params from URL
	const { pipelineName, workflowId, attemptId } = useParams();

	// Declare states
	const [loading, setLoading] = useState(true);
	const [schemaData, setSchemaData] = useState(null);
	const [requiredFields, setRequiredFields] = useState(null);
	const [workflow, setWorkflow] = useState({});
	const [attempt, setAttempt] = useState({});
	const [ postDescription ] = useState({});
	const [ postData, setPostData ] = useState({});
	const [ disabledLaunch, setDisabledLaunch ] = useState(true);
	const [ navigate, setNavigate ] = useState(false);
	const history = useHistory();
	// create references to track if data has been fetched
	const hasWorkflowData = useRef(false);


	// Fetch required fields depending on the kinds of inputs
	useEffect(() => {

		// create a pipeline
		if (pipelineName) {
			// find the JSON file that matches the pipeline name
			const schema = PIPELINES_LIST.find((p) => p.title === pipelineName);
			setSchemaData(schema);
			setLoading(false);
			// fetch the required fields
			const getRequiredTitles = (schema) => {
				return Object.values(schema.definitions || {}).flatMap(def =>
					(def.required || []).map(req => def.properties[req]?.title)
				).filter(Boolean);
			};
			let requiredFields = getRequiredTitles(schema);
			// get unique values and remove 'outdir' element
			requiredFields = [...new Set(requiredFields)].filter((value) => value !== 'Output directory');
			setRequiredFields(requiredFields);
		}

		// update workflows
		if (workflowId && attemptId) {
			// make the GET request to get the log
			const getWorkflowData = async (workflowId) => {
				try {
					const result = await workflowServices.get(workflowId);
					if (result) {
						setWorkflow(result);
						setLoading(false);
						// set the info of attempt execution
						setAttempt(globalServices.getAttemptById(result, attemptId));
					}
					else {
						showError('', 'The workflow info was not obtained correctly');
						console.error('The workflow info was not obtained correctly.');
					}
				} catch (error) {
					setLoading(false);
					console.error('Error getting workflow info:', error);
				}
			};
			// get the workflow data
			if (!hasWorkflowData.current) {
				getWorkflowData(workflowId);
				hasWorkflowData.current = true; // mark as fetched
			}
		}

	}, [pipelineName, workflowId, attemptId]);


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
		// Check if it is a re-launch
		let resume = false
		if (workflowId && workflow && attempt && Object.keys(workflow).length > 0 && Object.keys(attempt).length > 0) {
			resume = true;
		}
		// Check that all parameters are filled in and that the files are uploaded
		let allValid = true;
		// Validate the workflow (attempt) description and get the value
		let key = 'Description';
		let attemptDescription = '';
		if ( !(key in postDescription) ) {
			allValid = false;
			showWarning('',`Please fill in the '${key}' field.`);
		}
		else {
			attemptDescription = postDescription[key]['description'] || '';
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
				description: schemaData.description,
				pipeline: schemaData.url,
				revision: schemaData.revision,
			};
			// If it is a re-launch (resume execution). then, use workflowId
			// Otherwise, it is new workflow execution
			let wId = null;
			if ( resume && workflowId ) {
				wId = workflowId;
			}
			else {
				let result_create = await workflowServices.create(dataPOST);
				if (result_create && result_create._id) {
					wId = result_create._id;
				}
			}
			// Launch the workflow
			if ( wId ) {
				let inputsPOST = {
					'description': attemptDescription,
					'inputs': Object.values(postData),
					'resume': resume
				};
				const result_launch = await workflowServices.launch(wId, inputsPOST);
				showInfo('', result_launch.message);
				setNavigate(true); // set state to trigger navigation	
			}
		}
	};


	// Render
	return (
		loading ? (
			<div className="flex justify-content-center flex-wrap">
				<ProgressSpinner />
			</div>
		) : schemaData && workflow && attempt ? (
			<div className="parameters">
				<div className="grid">
					<div className="col-3">
						<SideMenu
							definitions={schemaData.definitions}
							launchWorkflow={launchWorkflow}
							disabledLaunch={disabledLaunch}
						/>
					</div>
					<div className="col-9">
						<DescriptionParameter title={pipelineName} postData={postDescription} defaultValue={attempt.description} />
						<Properties
							definitions={schemaData.definitions}
							attempt={attempt}
							setPostData={setPostData}
							postData={postData}
						/>
					</div>
				</div>
			</div>
		) : (<p>The pipeline schema is required</p>)
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
const Properties = ({ definitions, attempt, setPostData, postData }) => {

	// Create the panel header
	const header = (definition) => {
		return (
		<div className='parameter-panel-header'>
			<i className={definition.fa_icon} style={{fontSize:'1.25rem',marginRight:'0.5em'}}></i>{definition.title}
		</div>      
		);
	};

	// Component for rendering input properties
	const Inputs = ({ pName, property, defaultValue }) => {
		// declare state with the default value
		const [defValue, setDefValue] = useState(defaultValue || '');

		// update state when default value is not null
		useEffect(() => {
			if (defaultValue && 'value' in defaultValue) {
				setDefValue(defaultValue.value);
			}
		}, [defaultValue]);

		return (
		<>
		{(property.format === 'path' || property.format === 'directory-path') && (
			<DatasetExplorerDialog
				pName={pName}
				property={property}
				postData={postData}
				defaultValue={defValue}
			/>
		)}
		{property.format === 'file-path' && (			
			<DatasetExplorerDialog
				pName={pName}
				property={property}
				postData={postData}
				defaultValue={defValue}
			/>
		)}
		{property.format === 'string' && (
			<StringParameter
				pName={pName}
				property={property}
				postData={postData}
				defaultValue={defValue}
			/>
		)}
		{property.format === 'boolean' && (
			<BooleanParameter
				pName={pName}
				property={property}
				postData={postData}
				defaultValue={defValue}
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
					<Inputs pName={j} property={definitions[i].properties[j]} defaultValue={globalServices.getAttemptInputByName(attempt, `--${j}`)} />
				</div>
			))}
			</Panel>
		</div>
		))}
		</>
	);
};





export default Pipeline;
