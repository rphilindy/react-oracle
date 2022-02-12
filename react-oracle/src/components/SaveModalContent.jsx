import React, {useState, useEffect} from 'react';

export default function SaveModalContent(props) {

    const {queries, handleChange} =  props;

    const [selQuerySet, setSelQuerySet] = useState("");
    const [qsKey, setQsKey] = useState("");
    const [qKey, setQKey] = useState("");

    useEffect(()=>{if(selQuerySet!=="") setQsKey(selQuerySet)},[selQuerySet])
    useEffect(()=>{if(selQuerySet!==qsKey) setSelQuerySet("")},[qsKey])
    useEffect(()=>{handleChange?.(qsKey,qKey)},[qKey, qsKey]);

    return <div>
        <div>
            <select value={selQuerySet} onChange={(e)=>setSelQuerySet(e.target.value)}>
                <option></option>
                {Object.entries(queries.querySets).map(([qsKey],i)=><option value={qsKey} key={i}>{qsKey}</option>)}
            </select>
        </div>
        <div><input type="text" value={qsKey} onChange={e=>setQsKey(e.target.value)}/></div>
        <div><input type="text" value={qKey} onChange={e=>setQKey(e.target.value)}/></div>
    </div>;
}