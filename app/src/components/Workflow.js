/*
 * Import libraries
 */

import React, {
  useState,
  useEffect,
	useRef
} from 'react';
import {
  useParams,
} from 'react-router-dom';
import {
  TabView,
  TabPanel
} from 'primereact/tabview';
import { Card } from 'primereact/card';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import AnsiToHtml from 'ansi-to-html';
import classNames from 'classnames';
import {
  showError,
} from '../services/toastServices';
import { workflowServices } from '../services/workflowServices';
import { outputServices } from '../services/outputServices';

  
  
/*
 * Components
 */
  

const Workflow = (data) => {
	// capture data from URL
	const { workflowId, attemptId } = useParams();
	// create constants
  const [workflow, setWorkflow] = useState({});
	// ref to track if data has been fetched
	const hasWorkflowData = useRef(false);

  // // get the request data
  // useEffect(() => {
	// 	if ( data.location.state.schema ) {
	// 		setWorkflow(data.location.state.schema);
	// 	}
	// }, [data]);

  // get the workflow data
  useEffect(() => {
		if (workflowId) {
			if (!hasWorkflowData.current) {
				getWorkflowData(workflowId);
				hasWorkflowData.current = true; // mark as fetched
			}
		}
	}, [workflowId]);

	// Make the GET request to get the log
	const getWorkflowData = async (workflowId) => {
		try {
			const result = await workflowServices.get(workflowId);
			if (result) {
				console.log("getWorkflowData");
				setWorkflow(result);
			}
			else {
				showError('', 'The workflow info was not obtained correctly');
				console.error('The workflow info was not obtained correctly.');
			}
		} catch (error) {
			console.error('Error getting workflow info:', error);
		}
	};

	return (
		<>
			<WorkflowCard workflow={workflow} />
			<WorkflowPanels workflowId={workflowId} attemptId={attemptId} />
		</>
	);
};


const WorkflowCard = ({workflow}) => {
	return (
		<div className="card-workflow">
			<Card title={workflow['name']}>
				<small className="m-0">{workflow['description']}</small>
			</Card>
		</div>
	);
};


const WorkflowPanels = ({workflowId, attemptId}) => {
	// create constants
  const [activeIndex, setActiveIndex] = useState(0);
  const [execLogText, setExecLogText] = useState('');
  const [moduleFiles, setModuleFiles] = useState({});
	const [logFiles, setLogFiles] = useState({});
	// ref to track if data has been fetched
	const hasLogData = useRef(false);

  // get the request data
  useEffect(() => {
		if (workflowId && attemptId) {
			if (!hasLogData.current) {
				getWorkflowLog(workflowId, attemptId);
				hasLogData.current = true; // Mark as fetched
			}
		}
	}, [workflowId, attemptId]);

	// Make the GET request to get the log
	const getWorkflowLog = async (workflowId, attemptId) => {
		try {
			const result = await workflowServices.log(workflowId, attemptId);
			if (result && result.log) {
				console.log("getWorkflowLog");
				setExecLogText(result.log);
			}
			else {
				showError('', 'The log info was not obtained correctly');
				console.error('The log info was not obtained correctly.');
			}
		} catch (error) {
			console.error('Error getting log:', error);
		}
	};

	// Make the GET request to get the outputs
	// Select the type of output: modules, module logs
	const getWorkflowOutputs = async (workflowId, attemptId, typeOutput) => {
		try {
			const result = await outputServices.get(workflowId, attemptId);
			if (result) {
				// filter the output files based on the main folder
				const filteredResult = result.filter(item => item.data.name === typeOutput);
				if ( typeOutput === 'modules' ) {
					setModuleFiles(filteredResult);
				}
				else if ( typeOutput === 'logs' ) {
					setLogFiles(filteredResult);
				}
				console.log("getWorkflowOutputs");
			}
			else {
				showError('', 'The outputs were not obtained correctly');
				console.error('The outputs were not obtained correctly.');
			}
		} catch (error) {
			console.error('Error getting outputs:', error);
		}
	};


	// Controls the Tab Views
  const onTabChange = (e) => {
    setActiveIndex(e.index);
		switch (e.index) {
			case 0:
				getWorkflowLog(workflowId, attemptId);
				break;
			case 1:
				getWorkflowOutputs(workflowId, attemptId, 'modules');
				break;
			case 2:
				getWorkflowOutputs(workflowId, attemptId, 'logs');
				break;
			default:
				break;
		}
  };

	return (
		<div className="panel-workflow flex justify-content-center">
				<TabView activeIndex={activeIndex}  onTabChange={onTabChange}>
						<TabPanel header="Execution log" >
							<Terminal execLogText={execLogText} />
						</TabPanel>
						<TabPanel header="File viewer">
							<FileViewer files={moduleFiles} />
						</TabPanel>
						<TabPanel header="Log viewer">
							<FileViewer files={logFiles} />
						</TabPanel>
				</TabView>
		</div>
	);
};




/* Execution log */
const Terminal = ({ execLogText }) => {
	if (execLogText === '') { execLogText = 'Sorry. The log info is empty' }
	const convert = new AnsiToHtml();
	const html = convert.toHtml(execLogText);
	return ( <div className="terminal-container" dangerouslySetInnerHTML={{ __html: html }}></div> );
};



/* File viewer */
const FileViewer = ({files}) => {
	const actionTemplate = () => {
		return (
		<div className="flex flex-wrap gap-2">
				<Button type="button" icon="pi pi-search" rounded></Button>
				<Button type="button" icon="pi pi-pencil" severity="success" rounded></Button>
		</div>
		);
	};

	const togglerTemplate = (node, options) => {
		if (!node) { return; }
		const expanded = options.expanded;
		const iconClassName = classNames('p-treetable-toggler-icon pi pi-fw', {
				'pi-caret-right': !expanded,
				'pi-caret-down': expanded
		});
		return (
		<button type="button" className="p-treetable-toggler p-link" style={options.buttonStyle} tabIndex={-1} onClick={options.onClick}>
				<span className={iconClassName} aria-hidden="true"></span>
		</button>
		);
	};

	const header = (
		<div className="flex justify-content-start">
				<Button icon="pi pi-refresh" label="Reload" severity="warning" />
		</div>
	);

	return (
	<div className="card">
			<TreeTable value={files} header={header} togglerTemplate={togglerTemplate} tableStyle={{ minWidth: '50rem' }}>
					<Column field="name" header="Name" expander></Column>
					<Column field="size" header="Size"></Column>
					<Column field="type" header="Type"></Column>
					<Column body={actionTemplate} headerClassName="w-10rem" />
			</TreeTable>
	</div>
	);
};


/* Log viewer */
// const LogViewer = () => {
// 	return (
// 		<div className='log-viewer'>
// 			<p>LOGSS!!! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo 
// 				consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
// 		</div>
// 	);
// };

export default Workflow;

