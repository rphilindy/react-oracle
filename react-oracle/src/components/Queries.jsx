import React, {useState} from 'react';
import '../styles/queries.css';


export default function Queries(props) {

    const [expanded, setExpanded] = useState({});
    const [selQuery, setSelQuery] = useState(null);
    const {handleQueryClick,queries} = props;

    const toggle = (qsKey) => {
        let exp = {...expanded};
        exp[qsKey] = !exp[qsKey];
        setExpanded(exp);
    }


    if(!queries?.querySets) return '';

    return <ul>
        {
            Object.entries(queries.querySets)
                .map(([qsKey, qsVal], i) => <li key={i} onClick={()=>toggle(qsKey)}  className={(expanded[qsKey]? 'expanded': '')} >
                    {qsKey}
                    <ul style={{display: (expanded[qsKey]? '': 'none')}}>
                    {
                        Object.entries(qsVal.queries)
                            .map(([qKey, qVal], i) => <li key={i} className={qVal===selQuery? 'selected' : ''} onClick={(e)=>{
                                setSelQuery(qVal);
                                e.stopPropagation();
                                handleQueryClick?.(qVal, qsVal, qKey, qsKey);
                                }}>
                                {qKey}
                            </li>)
                    }
                    </ul>
                </li>)
        }
    </ul>;
}