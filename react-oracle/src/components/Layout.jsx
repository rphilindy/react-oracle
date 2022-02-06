//the primary layout for this app

import React, {useState, useEffect} from 'react';
import ConnectionBar from './ConnectionBar';
import '../styles/layout.css';

export default function Layout() {

    const[selectedConnection, setSelectedConnection] = useState(null); //the selection chosen in ConnectionBar
    const[connectionStatus, setConnectionStatus] = useState(null); //the selection status in ConnectionBar  null 'connected' or 'connecting'

    //show only the layout with labels
    const showLayoutLabelsOnly = false;

    //connection was changed
    useEffect(()=>{
        console.log(selectedConnection);
    },[selectedConnection]);


    return outermostContainer();

    function outermostContainer() {
        return <div className="layout-outermost-container">
            <div>
                {workspacesContainer()}
                {rightOfWorkspacesContainer()}
            </div>
        </div>;
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
            </div>    
        </div>;
    }

    function connectionContainer() {
        return <div className="layout-connection-container">
            {showLayoutLabelsOnly ? 'connection container' : <ConnectionBar connectionStatus={connectionStatus} handleConnectionChange={(conn)=>setSelectedConnection(conn)} />}
        </div>;
    }
}

