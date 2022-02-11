import React, {useState} from 'react';
import '../styles/queries.css';


export default function Queries(props) {

    const [expanded, setExpaned] = useState({});
    const {handleQueryClick,queries} = props;

    const toggle = (qsKey) => {
        let exp = {...expanded};
        exp[qsKey] = !exp[qsKey];
        setExpaned(exp);
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
                            .map(([qKey, qVal], i) => <li key={i} onClick={(e)=>{
                                e.stopPropagation();
                                handleQueryClick?.(qVal, qsVal);
                                }}>
                                {qKey}
                            </li>)
                    }
                    </ul>
                </li>)
        }
    </ul>;
}