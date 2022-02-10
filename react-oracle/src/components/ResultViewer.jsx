//result viewer component

import React, {useState, useRef, useEffect} from 'react';
import '../styles/results-viewer.css';
import API from '../libraries/api';

export default function ResultViewer (props) {

    const [state, setState] = useState({});
    const [clobOverlayState, setClobOverlayState] = useState(null);
    
    const cursorData = useRef({}); 
    const pageSizes = [10,25,50,100,500,1000];
    const {getRows} = API();

    const {execResult, connectionId, handleError} = props;
    const showLayoutOnly = false; //to show just the layout for development

    useEffect(()=>{

        //any time we clear execResult, get rid of cursorData
        if(!execResult) {
            cursorData.current = {};
            setState({});
        }
        //show the first result if available
        else if (!state.selectedTab && execResult.results?.length){
            const res = execResult.results[0];
            const selTab = res.cursors?.[0] || res;
            show({selectedTab: selTab});
        }
    },[execResult]);

    //this gives the browser a chance to caluclate the overlay's client width / height, then displays it
    useEffect(()=>{

        setTimeout(()=>{
            const d = document.querySelector('.results-viewer-clob-overlay');
            if (!d) return;

            d.style.display = 'inline-block';           

            //move bottom to previous top
            d.style.top = (parseInt(d.style.top) - d.clientHeight)+"px"; 


            //move left if needed
            if(d.offsetLeft + d.clientWidth > window.innerWidth){
                d.style.left =  (parseInt(d.style.left) - (d.offsetLeft + d.clientWidth - window.innerWidth + 30))+"px"; 
            }

        },10)


    }
        ,[clobOverlayState]);
    
    
    //if no result, show nothing
    if(!showLayoutOnly && !execResult?.results?.length)
        return <div className="results-view-no-records-placeholder"></div>;



    //to show just the execResult for development
    //return JSON.stringify(execResult);

    const button = (key, disabled, text, tab) => <button 
        key={key}
        className="results-viewer-cursor-button"
        disabled={tab === state.selectedTab}
        onClick={()=>{show({selectedTab: tab})}}
        >
            {text}
        </button>;



    //coalesce buttons
    const cursorButtons = (stmtIndex, cursors) => cursors.map((cursor,i) => button(`${stmtIndex}:${i}`, false, `${stmtIndex + 1}: ${cursor.name}`, cursor));
    const stmtResultButton = (stmtIndex, stmtResult) => button(`${stmtIndex}`, false, `${stmtIndex + 1}: Result`, stmtResult);
    const stmtButtons = (stmtIndex, stmtResult) => stmtResult.cursors ? cursorButtons(stmtIndex, stmtResult.cursors) : [stmtResultButton(stmtIndex, stmtResult)];
    const buttons = () => execResult?.results.map((stmtResult, stmtIndex) => stmtButtons(stmtIndex, stmtResult));
    const tabs = showLayoutOnly ? <button className="results-viewer-cursor-button">1: Cursor 1</button> : buttons();


    const thead = showLayoutOnly ? <thead><tr><td></td><td>col1</td><td>col2</td></tr><tr><td></td><td>number</td><td>varchar(20)</td></tr></thead> :
    <thead>
        {state.selectedTab?.affected && <tr><td>{state.selectedTab.affected} record(s) affected</td></tr>}
        {state.selectedTab?.error && <tr><td>Error: {state.selectedTab.error.message}</td></tr>}
        <tr><td></td>{state.selectedTab?.columns?.map((c,i) => <td key={i}>{c.name}</td>)}</tr>
        <tr><td></td>{state.selectedTab?.columns?.map((c,i) => <td key={i}>{c.type}</td>)}</tr>
    </thead>;

    const clobClick = (e) => {
        
        const d = document.querySelector('.results-viewer-clob-overlay');
        if(d) d.style.display = 'none';           

        setClobOverlayState(null);
        setClobOverlayState({target: e.target, text: "clob text"});
    }
    

    const cell = (col,j) => {
        //className based on type
        const type = col === null ? 'NULL' : state.selectedTab.columns[j]?.type.replace(/[^A-Z]/g,'');

        //dates
        if(type === "DATE")
            col = col ? new Date(col).toLocaleString().replace(',','') : '';

        //clobs when not displaying clobs   
        if(type === "CLOB")
            col = col && Array.isArray(col) ? <div style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={clobClick}>{JSON.stringify(col)}</div> : col;

        return <td key={j} className={"results-viewer-cell-" + type}>{col}</td>;
    }

    const tbody = showLayoutOnly ? <tbody><tr><td>1</td><td>d1</td><td>d2</td></tr><tr><td>2</td><td>d3</td><td>d4</td></tr></tbody> : 
        <tbody>{state.rows?.map((row,i) => <tr key={i}><td>{state.startRow + i + 1}</td>{row.map((col, j) => cell(col, j))}</tr>)}</tbody>;
    

    const table=<table className="results-viewer-table">{thead}{tbody}</table>;        

    return <div className="results-viewer-container">
        <div className="results-viewer-cursor-button-container">
            {tabs}
        </div>
        <div className="results-viewer-table-container">
            {table}
        </div>
        <div className="results-viewer-paging-bar">
             {showLayoutOnly? 'Page Bar' : state.selectedTab?.columns ? pageBar() : ''}
        </div>
        {clobOverlay()}
   </div>;


    function clobOverlay (){
    
        if (clobOverlayState === null)
            return "";

        const {target, text} = clobOverlayState;
        const rect = target.getBoundingClientRect();
        const height = 30;
        const width = 30;
        let top = rect.top;
        let left = rect.left;
        // if(top + height > window.innerHeight) top=rect.top-height;
        // if(left + width > window.innerWidth) left=rect.left-width;


        return <div style={{top, left, display:'none'}} className="results-viewer-clob-overlay">
        <div><button onClick={()=>setClobOverlayState(null)}>X</button></div>
        <div><pre>{text}</pre></div>
    </div>


    }




    function pageBar(){
        const {selectedTab, rows, rowCount, rowsPerPage, startRow} = state;
        const canPrev = startRow > 0;
        const first = () => show({selectedTab, startRow: 0});
        const prev = () => show({selectedTab, startRow: startRow - rowsPerPage < 0 ? 0 : startRow - rowsPerPage});
        const canNext = rowCount === undefined || startRow + rowsPerPage < rowCount;
        const next = () => show({selectedTab, startRow: startRow + rowsPerPage});
        const last = () => show({selectedTab, startRow: rowCount === undefined ? -1 : Math.floor(rowCount/rowsPerPage) * rowsPerPage});

        const recTxt = rows ? `${startRow + 1} - ${startRow + rows.length}${rowCount ? ` of ${rowCount}` : ''}`: '';
        const options = pageSizes.map(p => <option value={p} key={p}>{p}</option>);
        const changeSelect = (e) => show({selectedTab, startRow, rowsPerPage: parseInt(e.target.value)});
        const select = <select value={rowsPerPage} onChange={changeSelect}>{options}</select>;

        return <React.Fragment>
            &nbsp;&nbsp;&nbsp;&nbsp;
            Show&nbsp;&nbsp;{select}&nbsp;&nbsp;Rows
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button disabled={!canPrev} onClick={first}>&lt;&lt;</button>
            <button disabled={!canPrev} onClick={prev}>&lt;</button>
            <div className="results-viewer-rec-position">{recTxt}</div>
            <button disabled={!canNext} onClick={next}>&gt;</button>
            <button disabled={!canNext} onClick={last}>&gt;&gt;</button>
        </React.Fragment>;
    }



    async function show (args) {

        let {selectedTab, startRow, rowsPerPage} = args;
        
        //if we're changing to a cursor tab for the first time, get its cursorData or create one
        let cursordata;
        let rows;

        if(selectedTab.columns) {
            cursordata = cursorData.current[selectedTab.id];    
            if(!cursordata){
                cursordata = {
                    startRow: 0,
                    rowsPerPage: 10,
                };        
            }
        } 

        let rowCount;    
        
        if(cursordata) {

            if (startRow === undefined) startRow = cursordata.startRow;
            rowsPerPage = rowsPerPage || cursordata.rowsPerPage;
            rowCount = cursordata.rowCount;

            //round the pages to pagesPerRow boundaries
            if(startRow !== -1) startRow = Math.floor(startRow / rowsPerPage) * rowsPerPage;

            //get data from API
            const json = await getRows(connectionId, selectedTab.id, startRow, rowsPerPage);

            //if error, display & quit
            if(json.error) {
                handleError({heading: 'Fetch Error', message: json.error.message});
                return;
            }

            //if we've learned the rowcount
            if (json.rowCount) {
                rowCount = json.rowCount;
                cursordata.rowCount = json.rowCount;
            }

            //api tells us the starRow (if we asked for last page [startRow = -1])
            ({rows, startRow} = json);
            cursordata.startRow = startRow;
            cursordata.rowsPerPage = rowsPerPage;

            //remember cursordata
            cursorData.current[selectedTab.id] = cursordata;
        }


        //update state
        setState({
            selectedTab,
            startRow,
            rowsPerPage, 
            rowCount,
            rows    
        });
    }


}