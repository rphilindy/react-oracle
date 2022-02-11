//the primary layout for this app

import React, {useState, useEffect, useRef} from 'react';
import { useBeforeunload } from 'react-beforeunload';      //to close connections on unload

import Modal from './Modal';
import ConnectionBar from './ConnectionBar';
import SqlEditor from './SqlEditor';
import ResultViewer from './ResultViewer';
import Queries from './Queries';

import LayoutFuncs from '../libraries/layout';

import '../styles/layout.css';

export default function Layout() {

    //state
    const[connections, setConnections] = useState([]);
    const[queries, setQueries] = useState({});
    const[selectedConnection, setSelectedConnection] = useState(null); //the selection chosen in ConnectionBar
    const[connectionStatus, setConnectionStatus] = useState('disconnected'); //connecting connected disconnecting disconnected
    const[modal, setModal] = useState(null); //{heading: 'Error', content: 'Message'} to show dialog
    const[resultBarText, setResultBarText] = useState("Ready");
    const[execResult, setExecResult] = useState(null); //json returned from api execute
    

    //refs
    const editorMethods = useRef(null); //functions in sqlEditor
    const connectionId = useRef(null); //unique id for the connection from the API (so multiple windows have their pwn connection)
    
    //libraries
    const {disconnect, connect, execute, handleQueryClick, handleSaveClick, getConnections, getQueries} = LayoutFuncs(); //access to functions
    const args={selectedConnection, setConnectionStatus, connectionId, editorMethods, setModal, setResultBarText, setExecResult, setSelectedConnection, setConnections, setQueries}; //for every all to LayoutFuncs (layout.js)

    //show only the layout with labels
    const showLayoutLabelsOnly = false;

    //initialize connections/queries
    useEffect(()=>{
        (async()=>{
            if((await getConnections(args)).error) return;
            if((await getQueries(args)).error) return;

        })()
        
    },[]);


    //connection was changed: todo: this raises a warning about asyncs but trying to fix it didn't work
    useEffect(()=> (async ()=>{

        //disconnect if connected
        await disconnect(args);
        
        //connect if connect selected and not connected
        await connect(args);

    })(),[selectedConnection]);

    //close any open connection on unload
    useBeforeunload(async (e) => {
        if(connectionId.current) {
            e.preventDefault();     
            setModal({heading:'Open Connection', content: "Please disconnect."});
        }
    });

    //the component layout
    return outermostContainer();

    function outermostContainer() {
        return <React.Fragment>
            <div className="layout-outermost-container">
            <div>
                {workspacesContainer()}
                {rightOfWorkspacesContainer()}
            </div>
        </div>
        {modalContainer()}
        </React.Fragment>;
    }
    
    function modalContainer(){
        if(!modal) return '';
        return <Modal heading={modal.heading} content={modal.content} handleCloseClick={()=>setModal(null)}/>;
    }

    function workspacesContainer() {
        return <div className="layout-workspaces-container">
            <div>{showLayoutLabelsOnly ? 'workspaces container' : <Queries queries={queries} handleQueryClick={(q, qset)=>handleQueryClick(q,qset,args)}/>}</div>
        </div>;
    }

    function rightOfWorkspacesContainer() {
        return <div className="layout-right-of-workspaces-container">
            <div>
                {connectionContainer()}
                {sqlEditorContainer()}
                {commandsContainer()}
                {resultsContainer()}

            </div>    
        </div>;
    }

    function connectionContainer() {
        return <div className="layout-connection-container">
            {showLayoutLabelsOnly ? 'connection container' : <ConnectionBar connections={connections} connectionStatus={connectionStatus} handleConnectionChange={(conn)=>setSelectedConnection(conn)} selectedConnection={selectedConnection}/>}
        </div>;
    }

    function sqlEditorContainer() {
        return <div className="layout-sql-editor-container">
            {showLayoutLabelsOnly ? 'sql editor container' : <SqlEditor handleGetMethods={(methods) => editorMethods.current = methods}/>}
        </div>;
    }

    function commandsContainer() {
        return <div className="layout-commands-container">
            {showLayoutLabelsOnly ? 'commands container' : 
                <React.Fragment>
                    <div className="layout-commands-result-text">{resultBarText}</div>
                    <button disabled={false && connectionId.current === null} onClick={()=> execute(args)}>Execute</button>
                    <button disabled={false} onClick={()=> handleSaveClick(args)}>Save</button>
                </React.Fragment>
            }
        </div>;
    }

    function resultsContainer(){
        return <div className="layout-results-container">
            {showLayoutLabelsOnly ? 'results container' : 
                <ResultViewer execResult={execResult} connectionId={connectionId.current} handleError={err => setModal({heading: 'Error', content: err})}/>
            }
        </div>;
    }
}

