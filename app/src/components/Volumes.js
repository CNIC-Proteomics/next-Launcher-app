/**
 * Import libraries
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import { showError } from '../services/toastServices';
import { volumeServices } from '../services/volumeServices';



/**
 * Component that creates the workflow page from the workflow ID and the number of execution attempt.
 */
const Volumes = ({ hideDialog, dataset, updateDataset }) => {

  // Define columns
	const columns = [
		{ field: 'name', header: 'Name', expander: true },
		{ field: 'type', header: 'Type' },
		{ field: 'size', header: 'Size' }
	];


  // Declare states
  const [loading, setLoading] = useState(true);
  const [volumes, setVolumes] = useState([]);
	const [selectedKeys, setSelectedKeys] = useState({});
	const [expandedModuleKeys, setExpandedModuleKeys] = useState({});
	const [isSelected, setIsSelected] = useState(false);
	const [scrollHeight, setScrollHeight] = useState('400px'); // default height
	const [searchPath, setSearchPath] = useState('');
  // ref to track if data has been fetched
  const hasWkfData = useRef(false);
	const treeTableRef = useRef(null); // reference for scrolling


	// Get the volumes calling the service
	// with useCallback: Memoize the fetchWorkflows function
  const fetchVolumes = useCallback(async () => {
    // transform raw dataset data to displayable format for the DataTable.
    // adds action buttons for each dataset.
    const transformData = (data) => {
			return data.map((volume) => ({
				key: volume.volume, // use the volume path as a unique key
				data: { id: volume.volume, name: volume.volume, type: "folder", size: "", expander: true, isRoot: true },
				children: volume.files.map((file) => ({
					key: file.key,
					data: {
						id: file.data.id,
						name: file.data.name,
						type: file.data.type === "folder" ? file.data.type : 'file',
						status: 'linkable',
						checked: false,
						size: file.data.size,
						expander: file.data.type === "folder", // expander for folders
					},
					children: file.data.type === "folder" ? [{}] : [], // empty array for folders to enable lazy loading
				})),
			}));
		};

		try {
      const data = await volumeServices.get();
      if ( data !== null ) {
        setVolumes(transformData(data));
        setLoading(false);	
      }
		} catch (error) {
      console.error('Error fetching volumes:', error);
      setLoading(false);
		}
  }, []);


	// Fetch folder contents dynamically
	const fetchFolderContents = async (volumeDir) => {
		try {
			const volumeData = await volumeServices.get(volumeDir);
			if (volumeData && volumeData.length >= 0) {
				return volumeData[0].files.map((file) => ({
					key: file.key,
					data: {
						id: file.data.id,
						name: file.data.name,
						type: file.data.type === "folder" ? file.data.type : 'file',
						status: 'linkable',
						checked: false,
						size: file.data.size,
						expander: file.data.type === "folder", // expander for folders
					},
					children: file.data.type === "folder" ? [{}] : [], // empty array for folders to enable lazy loading
				}));
			}
		} catch (error) {
			console.error(`Error fetching contents for folder ${volumeDir}:`, error);
			return [];
		}
	};


	// Handle row expansion
	const handleExpand = async (event) => {
		const folder = event.node;
		const folderKey = folder.key;

		// only fetch data if the folder hasn't been loaded yet
		if (!folder.children || 
			(folder.children.length === 0) ||
			(folder.children.length === 1 && Object.keys(folder.children[0]).length === 0)) {
				setLoading(true); // mark folder as loading
				const children = await fetchFolderContents(folderKey);
				const updatedVolumes = volumes.map((volume) => {
					if (volume.key === folderKey) {
						return { ...volume, children };
					}
					if (volume.children) {
						// update nested nodes recursively
						return {
							...volume,
							children: updateNodeChildren(volume.children, folderKey, children),
						};
					}
					return volume;
				});
				setVolumes(updatedVolumes);
      	setLoading(false); // remove folder from loading state
		}
	};


	// Recursively update children for a specific node
	const updateNodeChildren = (nodes, targetKey, newChildren) => {
		return nodes.map((node) => {
			if (node.key === targetKey) {
				return { ...node, children: newChildren };
			}
			if (node.children) {
				return { ...node, children: updateNodeChildren(node.children, targetKey, newChildren) };
			}
			return node;
		});
	};


	// Update dataset files/folders from the selected volumes
  const handleSelectVolumeFilesFolders = () => {
		// recursive function to find and clean node data
		const findAndCleanNodeData = (key, nodes, parentLinkable = false) => {
			for (let node of nodes) {
      	// skip empty nodes
      	if (!node || Object.keys(node).length === 0) continue;
				if (node.key === key) {
					// update node status if parent is linkable
					if (parentLinkable) {
						node.data.status = 'notlinkable';
					}
					// clean the node's children recursively
					if (node.children) {
						node.children = node.children
							.map((child) => findAndCleanNodeData(child.key, [child], parentLinkable || node.data.status === 'linkable'))
							.filter(
								(child) =>
									// remove empty objects in children or remove invalid children
									child && !(Object.keys(child).length === 0 || (child.children && child.children.length === 1 && Object.keys(child.children[0]).length === 0))
							);
						// remove this node if it's a folder with no children
						if ( node.data.type === "folder" && (!node.children || node.children.length === 0) ) {
							return null; // mark this node for removal
						}
					}
					return node;
				}
				// search recursively if this node has children
				if (node.children) {
					const result = findAndCleanNodeData(key, node.children, parentLinkable);
					if (result) return result;
				}
			}
			return null; // key not found
		};
  	// filter keys where `checked: true`
  	const checkedKeys = Object.keys(selectedKeys).filter(
    	(key) => key !== 'undefined' && selectedKeys[key].checked === true
  	);
		// sort keys to ensure parent keys appear before children
		checkedKeys.sort();
		// filter to get parent keys
		const parentKeys = checkedKeys.filter(
			(key) => {
				return !checkedKeys.some(
					(otherKey) => otherKey !== key && key.startsWith(otherKey + '/'));
		});
		// map checked keys to their respective cleaned data
		const selectedItems = parentKeys.map((key) => findAndCleanNodeData(key, volumes)).filter(Boolean); // remove null values for deleted nodes;
  	// update dataset files
  	const updatedFiles = [...dataset.files, selectedItems].flat();
		updateDataset({ 'files': updatedFiles });
		hideDialog();
  };


	// The expandToPath function allows a React component to navigate through a tree structure (volumes) based on a given folder path.
	// It dynamically loads and expands the tree hierarchy to make all folders in the specified path visible in the UI.
	const expandToPath = async (givenPath) => {
		try {
			// normalize path delimiters
			givenPath = givenPath.replace(/\\/g, '/');

			// create a mutable copy
			const newExpandedKeys = { ...expandedModuleKeys };
			const updatedVolumes = [...volumes];

			// find the root volume matching the start of the given path
			let currentVolume = volumes.find((vol) => givenPath.startsWith(vol.key));
			if (!currentVolume) {
				showError('', `Volume not found for path: ${givenPath}`);
				console.error(`Volume not found for path: ${givenPath}`);
				return;
			}
			// mark this node as expanded
			newExpandedKeys[currentVolume.key] = true;

			// remove the volume's base path from the given path
			let currentPath = givenPath.replace(currentVolume.key, '').replace(/^\/+/, ''); // trim leading slashes
			let currentNodes = currentVolume.children; // start with the root children
			
			// get the last node key
			let lastNodeKey = currentVolume.key; 

			// traverse the folder hierarchy
			const folders = currentPath.split('/');
			for (const folder of folders) {

				if (!folder) continue; // skip empty segments

				// find the child node with the matching name
				let node = currentNodes.find((child) => child.data.name === folder);
				if (!node) {
					showError('', `Folder not found: ${folder}`);
					console.error(`Folder not found: ${folder}`);
					return;
				}

				// mark this node as expanded
				newExpandedKeys[node.key] = true;
				// get the last node key (for scrolling)
				lastNodeKey = node.key;

				// fetch children if necessary
				if (
					!node.children ||
					node.children.length === 0 ||
					(node.children.length === 1 && Object.keys(node.children[0]).length === 0)
				) {
					const nodeContent = await fetchFolderContents(node.key);
					node.children = nodeContent; // update the node with fetched content
				}

				// update currentNodes to traverse deeper
				currentNodes = node.children;
			}

			// update states
			setExpandedModuleKeys(newExpandedKeys);
			setVolumes(updatedVolumes);
			setSelectedKeys({ [lastNodeKey]: true }); // highlight the selected row

			// scroll to the last opened folder and highlight it
			setTimeout(() => {
				// Find the row using a unique attribute
				const row = document.querySelector(`[data-key="${lastNodeKey}"]`);
				if (row) {
					row.scrollIntoView({ behavior: 'smooth', block: 'center' });
					row.classList.add('highlight-row'); // add a class for highlighting
				}
			}, 100);

		} catch (error) {
			console.error('Error in expandToPath:', error);
			showError('', 'An error occurred while navigating to the specified path.');
		}
	};


	// Update dataset files/folders from the selected volumes
  const getSpecificPath = () => {
    if (searchPath) {
      expandToPath(searchPath);
    }
  };
	

	// Create the header
  const header = (
    <div className="flex p-inputgroup" style={{ padding: '0.5rem', alignItems: 'center' }}>
      <InputText
        style={{ width: '100%' }}
        placeholder="Go to the specific volume path..."
        value={searchPath}
        onChange={(e) => setSearchPath(e.target.value)}
				onKeyDown={(e) => { if (e.key === 'Enter') { getSpecificPath(); }	}}
      />
      <Button label="Search" onClick={getSpecificPath} icon="pi pi-search" />
    </div>
  );  	


	
	// Update the selected files based on the selection change
  const handleSelectionChange = (e) => {
    setSelectedKeys(e.value);
    setIsSelected(Object.keys(e.value).length > 0);
  };


	// Functions that freeze the elements opened in the file tree (viewer)
	const handleModuleExpand = (e) => {
		setExpandedModuleKeys(e.value);
	};


	// Add rowClassName for conditional styling
  const rowClassName = (node) => {
		if ( node ) {
			return {
				'highlight-row': node.data?.isRoot !== undefined, // apply highlight-row to the first folder
			};	
		}
  };


	// Allows you to perform side effects like data fetching after the component renders.	
	useEffect(() => {
		// fetch the volume data
    if (!hasWkfData.current) {
      fetchVolumes();
      hasWkfData.current = true; // mark as fetched
    }
		// dynamically calculate height based on window sice
    const updateScrollHeight = () => {
      const newHeight = window.innerHeight - 432; // adjust the subtraction value as needed
      setScrollHeight(`${newHeight}px`);
    };
    // set initial height
    updateScrollHeight();
    // listen for window resize
    window.addEventListener('resize', updateScrollHeight);
    // cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', updateScrollHeight);
    };
  }, [fetchVolumes]);

  
	// Render
	return (
		<div className='table-volumes'>
			<div className="field file-viewer">
				<TreeTable
					selectionMode="checkbox"
					scrollable
					scrollHeight={scrollHeight} // dynamically set height
					loading={loading}
					value={volumes}
					header={header}
					ref={treeTableRef}
					selectionKeys={selectedKeys}
					onSelectionChange={handleSelectionChange}
					tableStyle={{ minWidth: '50rem' }}
					expandedKeys={expandedModuleKeys}
					onToggle={handleModuleExpand}
					onExpand={handleExpand} // handle dynamic expansion
					rowClassName={rowClassName} // add rowClassName prop
				>
					{/* Render columns explicitly */}
					{columns.map((col, i) => (
						<Column className="short-column" key={col.field} field={col.field} header={col.header} expander={col.expander} filter filterPlaceholder={`Filter by ${col.field}`}/>
					))}
				</TreeTable>
			</div>
			<div className="field volume-submit flex justify-content-center">
				<Button label="Select" onClick={() => handleSelectVolumeFilesFolders()} disabled={!isSelected} />
			</div>
		</div>
	)
};


export default Volumes;
