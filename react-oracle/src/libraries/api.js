import generateMockData from './mockResults';
import connectionConfig from "../config/connections.json";
import queriesConfig from "../config/queries.json";

export default function API() {

    
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
        const json = await callApiMethod('execute', {connectionId, sql, params});
        return json;
    }

    async function getRows(connectionId, cursorId, startRow, numRows) {

        const json = await callApiMethod('get-rows', {connectionId, cursorId, startRow, numRows});
        return json;
    }

    async function getLob(connectionId, cursorId, row, col) {
        const json = await callApiMethod('get-lob', {connectionId, cursorId, row, col});
//        let json = {error: {message: 'test error'}, value: window.mockCurors[cursorId][row][col].clob};
        return json;
    }


    return {connect, disconnect, execute, getRows, getLob, getConnections, getQueries, saveQuery};

}