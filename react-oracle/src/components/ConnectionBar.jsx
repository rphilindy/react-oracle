//the connection bar, selector, connection status

import React from 'react';
import '../styles/connection-bar.css';
import connectionConfig from "../config/connections.json";

export default function ConnectionBar(props) {

    //show only the layout with labels
    const showLayoutLabelsOnly = false;
    const handleConnectionChange = props.handleConnectionChange || (() => {});
    const connectionStatus = props.connectionStatus;
    const statusText= `${connectionStatus?.toUpperCase()}${connectionStatus?.search(/ing$/) !== -1 ? '...' : ''}`;
    const statusStyle = `connection-bar-status-ind connection-bar-status-ind-${connectionStatus?.replace(/ /g,'-')}`;

    return <div className="connection-bar-container">
        <div className="connection-bar-label-container">{showLayoutLabelsOnly ? 'Label' : <label htmlFor="connectionSelect">Connection:</label>}</div>
        <div className="connection-bar-select-container">{showLayoutLabelsOnly ? 'Connection Selector' : connectionSelect()}</div>
        <div className="connection-bar-status-container">{showLayoutLabelsOnly ? 'Connection Status' : statusIndication()}</div>
    </div>;


    //select box with values of stringified connections or "" for disconnect
    function connectionSelect() {
        return <select id="connectionSelect" className="connection-bar-select" onChange={bubbleUpConnectionChange}>
            <option value="">(Disconnect)</option>
            {connectionConfig.map((cfg,idx) => <option key={idx} value={JSON.stringify(cfg)}>{`${cfg.user}@${cfg.server}`}</option>)}
        </select>;
    }

    //the status indication, color-coded
    function statusIndication() {
        return <span className={statusStyle}>{statusText}</span>
    }

    //pass connection changes to layout.jsx
    function bubbleUpConnectionChange(e){
        handleConnectionChange(e.target.value === "" ? null : JSON.parse(e.target.value));
    }
}