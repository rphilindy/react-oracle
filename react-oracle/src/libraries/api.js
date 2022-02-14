import generateMockData from './mockResults';
import connectionConfig from "../config/connections.json";
import queriesConfig from "../config/queries.json";

export default function API() {

    const {generate, parse} = generateMockData();
    const mockData = generate(mockDefs());
    //let mockCurors = {};
    
    const baseURL = "http://localhost:3001/";

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function callApiMethod (endpoint, json) {

        try {

            const response = await fetch(`${baseURL}${endpoint}`,{
                method: json ? 'POST' : 'GET', 
                body: json ? JSON.stringify(json) : null,
                headers: json ? { 'Content-Type': 'application/json' } : {}
            });
            //non OK statuses - return status as error
            if(response.status >= 300) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        }

        //return unexpected errors as {error: "..."}
        catch(e) {
            return {error: {message:`API unavailable: ${e.message || e.toString()}`}}
        }
    }

    async function getConnections(){
        await sleep(100);
        const json = {xerror: 'error', connections: connectionConfig};
        return json;
    }

    async function getQueries(){
        if(!window.queries)
            window.queries = queriesConfig;
        await sleep(100);
        const json = {xerror: 'error', queries: {...window.queries}};
        return json;
    }

    async function saveQuery(querySetKey, queryKey, querydef){
        let json = await getQueries();
        if(json.error)
            return json;
        let queries = json.queries;
        if(!queries.querySets[querySetKey])
            queries.querySets[querySetKey] = {queries: {}};
        queries.querySets[querySetKey].queries[queryKey] = querydef;
        window.queries = queries;
        return getQueries();
    }

    async function connect(connection) {
        const json = await callApiMethod('connect', {connection});
        return json;
    }

    async function disconnect(connectionId) {
        const json = await callApiMethod('disconnect', {connectionId});
        return json;
    }

    async function execute(connectionId, sql, params) {
        //const json = await callApiMethod('execute', {connectionId, sql});

        const stmts = parse(sql);
        let json = {results: [], span: 1000};

        await sleep(1000);
        stmts.map(stmt => {

            const mock = mockData.filter(m => m.sql.toUpperCase() === stmt.toUpperCase().trim())[0];
            if(!mock)  {
                json.results.push({sql: stmt, error:{message: 'No such mock data'}, span: 23});
                if(!json.error) json.error = {message: 'No such mock data', position: 0};
            }
            else {
                const id = Math.floor(Math.random() * 10000);
                if(!window.mockCurors) window.mockCurors = {};
                window.mockCurors[id] = mock.rows;
                json.results.push({sql: stmt, span: 23, cursors: [{
                    name: 'cursor1' ,
                    id: id,
                    columns: mock.columns,
                }]});
            }    
            
        });

        return json;
    }

    async function getRows(connectionId, cursorId, startRow, numRows) {
        //const json = await callApiMethod('get-rows', {connectionId, cursorId, numRows});
        
        let json ={};
        let rows = window.mockCurors[cursorId];
        let start = startRow;
        if(start === -1) start=Math.floor(rows.length/numRows) * numRows;
        json.rows = rows.slice(start, start + numRows);
        if(startRow === -1 || start + numRows > rows.length)
            json.rowCount = rows.length;
        json.startRow = start;
        json.span=25;

        //clobs - return array with position instead of value
        json.rows.map((r,ri) => json.rows[ri]=r.map((c,ci) => c?.clob ? [ri,ci] : c));

        return json;
    }

    async function getLob(connectionId, cursorId, row, col) {
        //const json = await callApiMethod('get-clob', {connectionId, cursorId, row, col});
        let json = {error: {message: 'test error'}, value: window.mockCurors[cursorId][row][col].clob};
        return json;
    }

    function mockDefs() {
        return [
            {
                sql: "select rand1 from dual",
                rowCount: 1,
                columns: [
                    {
                        name: 'RAND1',
                        type: 'NUMBER(38)',
                        value: (i,r) => r,
                    }
                ]
            },
            {
                sql: "select * from dual",
                rowCount: 55,
                columns: [
                    {
                        name: 'INST_ORD_ID',
                        type: 'NUMBER(38)',
                        value: i => i + 1000
                    },
                    {
                        name: 'INST_ORD_NO',
                        type: 'VARCHAR2(50)',
                        value: i => 'INST' +(i + 1000)
                    },
                    {
                        name: 'UPDATE_DATE',
                        type: 'DATE',
                        value: (i,r) => new Date(-Math.floor(r*1000000) + new Date().getTime())
                    },
                    {
                        name: 'UPDATE_DATE2',
                        type: 'DATE',
                        value: (i,r) => i%2 ? new Date() : null
                    },
                    {
                        name: 'COMMENT',
                        type: 'CLOB',
                        value: (i,r) => i%2 ? ({clob: r.toString()}) : null,
                    },
                ]
            },
        ];
    }

    return {connect, disconnect, execute, getRows, getLob, getConnections, getQueries, saveQuery};

}