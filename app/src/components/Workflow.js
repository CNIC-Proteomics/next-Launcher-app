/**
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
// import axios from 'axios';
import {
  TabView,
  TabPanel
} from 'primereact/tabview';
import { Card } from 'primereact/card';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import AnsiToHtml from 'ansi-to-html';
import classNames from 'classnames';
import {
  showError,
} from '../services/toastServices';
import { workflowServices } from '../services/workflowServices';
import { outputServices } from '../services/outputServices';
// import * as globalServices from '../services/globalServices';


  
  
/**
 * Component that creates the workflow page from the workflow ID and the number of execution attempt.
 */
const Workflow = () => {
	// capture data from URL
	const { workflowId, attemptId } = useParams();
	
	// create constants
	const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState({});
	// const [attempt, setAttempt] = useState({});
  const [execLogText, setExecLogText] = useState('');
  const [attemptStatus, setAttemptStatus] = useState('');
	// create references to track if data has been fetched
	const hasWorkflowData = useRef(false);
	const hasLogData = useRef(false);
	const logIntervalRef = useRef(null);
	// interval duration in milliseconds (e.g., 5000 ms for 5 seconds)
	const intervalDuration = 5000;

  // get the workflow data
  useEffect(() => {

		// make the GET request to get the log
		const getWorkflowData = async (workflowId) => {
			try {
				const result = await workflowServices.get(workflowId);
				if (result) {
					setWorkflow(result);
					setLoading(false);
					// set the info of attempt execution
					// setAttempt(globalServices.getAttemptById(result, attemptId));
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
		// make the GET request to get the log
		const getAttemptLog = async (workflowId, attemptId) => {
			try {
				const result = await workflowServices.log(workflowId, attemptId);
				if (result && result.log) {
					setExecLogText(result.log);
					setLoading(false);

					// check the status of attempt execution
					const newStatus = result.status;
					setAttemptStatus(newStatus);

					// stop the loop if status is 'completed' or 'failed'
					if (newStatus === 'completed' || newStatus === 'failed') {
						if (logIntervalRef.current) {
							clearInterval(logIntervalRef.current);
							logIntervalRef.current = null;
						}
					}
				}
				else {
					// showError('', 'The log info was not obtained correctly');
					console.error('The log info was not obtained correctly.');
				}
			} catch (error) {
				console.error('Error getting log:', error);
			}
		};

		if (workflowId && attemptId) {
			// get the workflow data
			if (!hasWorkflowData.current) {
				getWorkflowData(workflowId);
				hasWorkflowData.current = true; // mark as fetched
			}
			// get the log of attempt execution
			if (!hasLogData.current) {
				getAttemptLog(workflowId, attemptId);
				hasLogData.current = true; // mark as fetched
			}

			// set up the interval to update the log text
			logIntervalRef.current = setInterval(() => {
				getAttemptLog(workflowId, attemptId);
			}, intervalDuration);

			// clean up the interval on component unmount
			return () => {
				if (logIntervalRef.current) {
					clearInterval(logIntervalRef.current);
				}
			};

		}

	}, [workflowId, attemptId]);

	// Render
	return (
		<div className='report-workflow'>
		{loading ? (
			<div className="flex justify-content-center flex-wrap">
				<ProgressSpinner />
			</div>
		) : (
		<>
			<WorkflowCard workflow={workflow} status={attemptStatus} />
			<WorkflowPanels workflowId={workflowId} attemptId={attemptId} attemptStatus={attemptStatus} execLogText={execLogText} />
		</>
		)}
		</div>
	);
};




/**
 * Component that creates the workflow card with the name, description,...
 */
const WorkflowCard = ({workflow, status}) => {
  const severity = {
    running: 'info',
    completed: 'success',
    failed: 'error',
  }[status];

  return (
    <div className="card-workflow">
      <Card title={workflow.name}>
        <small className="m-0">{workflow.description}</small>
        <div className="status">
          <Message severity={severity} text={status} />
        </div>
      </Card>
    </div>
  );
};




/** 
 * Component that creates the workflow Panels: Execution log, Module file viewer, Log file viewer
 */
const WorkflowPanels = ({workflowId, attemptId, attemptStatus, execLogText}) => {
	// create constants
  const [moduleFiles, setModuleFiles] = useState({});
	const [logFiles, setLogFiles] = useState({});
  const [expandedModuleKeys, setExpandedModuleKeys] = useState({});
  const [expandedLogKeys, setExpandedLogKeys] = useState({});
	// ref to track if data has been fetched
	const hasOutputData = useRef(false);

  // get the request data
  useEffect(() => {
		if (workflowId && attemptId) {
			// get the outputs of attempt execution
			if (!hasOutputData.current) {
				getWorkflowOutputs(workflowId, attemptId, 'modules');
				getWorkflowOutputs(workflowId, attemptId, 'logs');
				hasOutputData.current = true; // mark as fetched
			}
		}
	}, [workflowId, attemptId]);


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
			}
			else {
				showError('', 'The outputs were not obtained correctly');
				console.error('The outputs were not obtained correctly.');
			}
		} catch (error) {
			console.error('Error getting outputs:', error);
		}
	};

	// Download the archive file for an attempt execution of a workflow
	const downloadArchive = async (workflowId, attemptId, cancelToken) => {
		try {
			await outputServices.archive(workflowId, attemptId, cancelToken);
		} catch (error) {
			showError('', 'The archive file was not downloaded correctly');
			console.error('Error getting archive:', error);
		}
	};

	// Download an output file for an attempt execution of a workflow
	const downloadOutput = async (workflowId, attemptId, output) => {
		try {
			// get the relative path of file
			let { name, path } = output.data;
			let filePath = `${path}/${name}`;
			await outputServices.single(workflowId, attemptId, filePath);
		} catch (error) {
			showError('', 'The output file was not downloaded correctly');
			console.error('Error getting output:', error);
		}
	};

	// Functions that freeze the elements opened in the file tree (viewer)
  const handleModuleExpand = (e) => {
    setExpandedModuleKeys(e.value);
  };
  const handleLogExpand = (e) => {
    setExpandedLogKeys(e.value);
  };

	// Render
	return (
		<div className="panel-workflow flex justify-content-center flex flex flex-row-reverse gap-2">
			<div className="panel-workflow-download-button">
				{ attemptStatus === 'completed' ? (<ArchiveButton workflowId={workflowId} attemptId={attemptId} downloadArchive={downloadArchive} />) : (<></>) }
			</div>
			<TabView>
					<TabPanel header="Execution log" >
						<Terminal execLogText={execLogText} />
					</TabPanel>
					<TabPanel header="File viewer">
						<div className='file-viewer'>
							<FileViewer
								typeOutput='modules'
								files={moduleFiles}
								expandedKeys={expandedModuleKeys}
								onToggle={handleModuleExpand}
								workflowId={workflowId}
								attemptId={attemptId}
								getWorkflowOutputs={getWorkflowOutputs}
								downloadOutput={downloadOutput}
							/>
						</div>
					</TabPanel>
					<TabPanel header="Log viewer">
						<div className='log-viewer'>
							<FileViewer
								typeOutput='logs'
								files={logFiles}
								expandedKeys={expandedLogKeys}
								onToggle={handleLogExpand}
								workflowId={workflowId}
								attemptId={attemptId}
								getWorkflowOutputs={getWorkflowOutputs}
								downloadOutput={downloadOutput}
							/>
						</div>
					</TabPanel>
			</TabView>
		</div>
	);
};





/**
 * Archive button: this component download the archive results of workflow
 */

const ArchiveButton = ({ workflowId, attemptId, downloadArchive }) => {
  const [downloading, setDownloading] = useState(false);
  const abortController = new AbortController(); // abort controller

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadArchive(workflowId, attemptId, abortController);
    } catch (error) {
      setDownloading(false);
      console.error('Error fetching data:', error);
    } finally {
      setDownloading(false);
    }
  };

//   const handleCancelClick = () => {
//     abortController.abort();
//     setDownloading(false);
//   };

  return (
	<>
    <Button
			label={downloading ? 'Downloading...' : 'Download'}
      icon={downloading ? 'pi pi-pause-circle' : 'pi pi-download'}
      onClick={handleDownload}
      disabled={downloading}
			severity={downloading ? 'secondary' : 'help'}
    >
    {downloading && <ProgressSpinner strokeWidth="8" style={{width:'20px',height:'20px'}} animationDuration=".5s" />}
    </Button>
		{/* {downloading && (<Button label="Stop" icon="pi pi-times" onClick={handleCancelClick} className="p-button-secondary p-button-outlined" />)} */}
	</>
  );
};





/**
 * Terminal: this component displays the execution log
 */
const Terminal = ({ execLogText }) => {
	// set default message if execLogText is empty
	if (execLogText === '') { execLogText = 'Sorry. The log info is empty' }
	const convert = new AnsiToHtml();
	const html = convert.toHtml(execLogText);
	const terminalRef = useRef(null);

  // scroll to the bottom whenever execLogText changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [execLogText]);

	return (
		<div className="terminal-container" ref={terminalRef} dangerouslySetInnerHTML={{ __html: html }}></div> );
};



/**
 * FileViewer: This component creates a TreeTable for the files of modules and logs.
 */
const FileViewer = ({typeOutput, files, expandedKeys, onToggle, workflowId, attemptId, getWorkflowOutputs, downloadOutput}) => {

	const actionTemplate = (rowData) => {
		if (rowData['data'].type !== 'folder') {
			return (
				<div className="action-button">
					<Button type="button" icon="pi pi-download" onClick={() => downloadOutput(workflowId, attemptId, rowData)}></Button>
				</div>
			);
		}
		return null; // don't render anything if the type is 'folder'
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

	// create the refresh and download button
	// The download button only appears when the attempt execution of workflow has been completed.
	const header = (
		<div className="header-button justify-content-start">
			<Button icon="pi pi-refresh" label="Reload" severity="warning" onClick={() => getWorkflowOutputs(workflowId, attemptId, typeOutput)}/>
		</div>
	);

	return (
	<div className="card">
			<TreeTable value={files} header={header} togglerTemplate={togglerTemplate} tableStyle={{inWidth:'50rem'}} expandedKeys={expandedKeys} onToggle={onToggle} >
					<Column field="name" header="Name" expander></Column>
					<Column field="size" header="Size" className="short-column"></Column>
					<Column field="type" header="Type" className="short-column"></Column>
					<Column 						 header="Action" className="short-column" body={actionTemplate} />
			</TreeTable>
	</div>
	);
};


export default Workflow;

