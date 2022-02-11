import React, {useState} from 'react';
import '../styles/queries.css';
import queriesConfig from "../config/queries.json";


export default function Queries(props) {

    const [expanded, setExpaned] = useState({});

    const toggle = (qsKey) => {
        let exp = {...expanded};
        exp[qsKey] = !exp[qsKey];
        setExpaned(exp);
    }

    return <ul>
        {
            Object.entries(queriesConfig.querySets)
                .map(([qsKey, qsVal]) => <li onClick={()=>toggle(qsKey)}  className={(expanded[qsKey]? 'expanded': '')} >
                    {qsKey}
                    <ul style={{display: (expanded[qsKey]? '': 'none')}}>
                    {
                        Object.entries(qsVal.queries)
                            .map(([qKey, qVal]) => <li onClick={(e)=>{e.stopPropagation();}}>
                                {qKey}
                            </li>)
                    }
                    </ul>
                </li>)
        }
    </ul>;
}