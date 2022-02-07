//the primary layout for this app

import React, {useState, useEffect, useRef} from 'react';
import { useBeforeunload } from 'react-beforeunload';      //to close connections on unload
import Modal from './Modal';
import ConnectionBar from './ConnectionBar';
import SqlEditor from './SqlEditor';
import API from '../libraries/api';
import LayoutFuncs from '../libraries/layout';
import '../styles/layout.css';

export default function Layout() {

    const[selectedConnection, setSelectedConnection] = useState(null); //the selection chosen in ConnectionBar
    const[connectionStatus, setConnectionStatus] = useState('disconnected'); //connecting connected disconnecting disconnected
    const[modal, setModal] = useState(null); //{heading: 'Error', content: 'Message'} to show dialog
    const api = API();           
    const {disconnect, connect} = LayoutFuncs(); //access to functions
    const connectionId = useRef(null);

    //show only the layout with labels
    const showLayoutLabelsOnly = false;

    //connection was changed
    useEffect(async ()=>{

        //disconnect if connected
        await disconnect(connectionId, setConnectionStatus, api, setModal);
        
        //connect if connect selected and not connected
        await connect(selectedConnection, connectionId, setConnectionStatus, api, setModal);

    },[selectedConnection]);

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
    
    function workspacesContainer() {
        return <div className="layout-workspaces-container">
            <div>{showLayoutLabelsOnly ? 'workspaces container' : ''}</div>
        </div>;
    }

    function rightOfWorkspacesContainer() {
        return <div className="layout-right-of-workspaces-container">
            <div>
                {connectionContainer()}
                {sqlEditorContainer()}
            </div>    
        </div>;
    }

    function connectionContainer() {
        return <div className="layout-connection-container">
            {showLayoutLabelsOnly ? 'connection container' : <ConnectionBar connectionStatus={connectionStatus} handleConnectionChange={(conn)=>setSelectedConnection(conn)} />}
        </div>;
    }

    function sqlEditorContainer() {
        return <div className="layout-sql-editor-container">
            {showLayoutLabelsOnly ? 'sql editor container' : <SqlEditor />}
        </div>;
    }

    function modalContainer(){
        if(!modal) return '';
        return <Modal heading={modal.heading} content={modal.content} handleCloseClick={()=>setModal(null)}/>;
    }
}

