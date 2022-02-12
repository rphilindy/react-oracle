import React, {useState, useEffect, useRef} from 'react';

export default function SaveModalContent(props) {

    const {queries, handleChange} =  props;

    const [selQsKey, setSelQsKey] = useState("");
    const [qsKey, setQsKey] = useState("");
    const [selQKey, setSelQKey] = useState("");
    const [qKey, setQKey] = useState("");
    const ref1 = useRef(null);
    const ref2 = useRef(null);

    useEffect(()=>{if(selQsKey!=="") setQsKey(selQsKey)},[selQsKey])
    useEffect(()=>{setSelQsKey(qsKey)},[qsKey])
    useEffect(()=>{if(selQKey!=="") setQKey(selQKey)},[selQKey])
    useEffect(()=>{setSelQKey(qKey)},[qKey])
    useEffect(()=>{handleChange?.(qsKey,qKey)},[qKey, qsKey]);

    return <div className="save-modal-content">
        <div>
            Query Set:
            <input type="text" ref={ref1} value={qsKey} onChange={e=>setQsKey(e.target.value)}/>
            <select value={selQsKey} onChange={(e)=>{setQKey(""); setSelQKey(""); setSelQsKey(e.target.value); ref1.current.focus();}}>
                <option></option>
                {Object.entries(queries.querySets).map(([qsKey],i)=><option value={qsKey} key={i}>{qsKey}</option>)}
            </select>
        
        </div>
        <div>
            Query:
            <input type="text" ref={ref2} value={qKey} onChange={e=>setQKey(e.target.value)}/>
            <select value={selQKey} onChange={(e)=>{setSelQKey(e.target.value); ref2.current.focus();}}>
                <option></option>
                {selQsKey !== "" && queries.querySets[selQsKey] && Object.entries(queries.querySets[selQsKey]?.queries).map(([qKey],i)=><option value={qKey} key={i}>{qKey}</option>)}
            </select>
        </div>
    </div>;
}