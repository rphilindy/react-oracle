import React, {useState, useEffect, useRef} from 'react';

export default function SaveModalContent(props) {

    const {queries, handleChange, selectedQuery} =  props;

    const [selQsKey, setSelQsKey] = useState(selectedQuery.current?.qsKey || "");
    const [qsKey, setQsKey] = useState(selectedQuery.current?.qsKey || "");
    const [selQKey, setSelQKey] = useState(selectedQuery.current?.qKey || "");
    const [qKey, setQKey] = useState(selectedQuery.current?.qKey || "");
    const ref1 = useRef(null);
    const ref2 = useRef(null);

    useEffect(()=>{handleChange?.(qsKey,qKey)},[qKey, qsKey]);


    return <div className="save-modal-content">
        <div>
            Query Set:
            
            <input type="text" ref={ref1} value={qsKey} onChange={e=>{
                setQsKey(e.target.value);
                if(queries.querySets[e.target.value]) setSelQsKey(e.target.value);
            }}/>
            
            <select value={selQsKey} onChange={(e)=>{
                setQKey(""); 
                setSelQKey(""); 
                setSelQsKey(e.target.value); 
                setQsKey(e.target.value); 
                ref1.current.focus();
            }}>
                <option></option>
                {Object.entries(queries.querySets).map(([qsKey],i)=><option value={qsKey} key={i}>{qsKey}</option>)}
            </select>
        
        </div>
        <div>
            Query:

            <input disabled={selQsKey === ""} type="text" ref={ref2} value={qKey} onChange={e=>{
                setQKey(e.target.value);
                if(queries.querySets[selQsKey]?.queries[e.target.value]) setSelQKey(e.target.value);
            }}/>
            
            <select disabled={selQsKey === ""} value={selQKey} onChange={(e)=>{
                setSelQKey(e.target.value); 
                setQKey(e.target.value); 
                ref2.current.focus();
            }}>
                <option></option>
                {selQsKey !== "" && Object.entries(queries.querySets[selQsKey].queries).map(([qKey],i)=><option value={qKey} key={i}>{qKey}</option>)}
            </select>
        </div>
    </div>;
}