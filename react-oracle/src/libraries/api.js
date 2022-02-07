export default function API() {
    
    const baseURL = "http://localhost:3001/";

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
            return {error: `API unavailable: ${e.message || e.toString()}`}
        }
    }

    async function connect(connection) {
        const json = await callApiMethod('connect', {connection});
        return json;
    }

    async function disconnect(connectionId) {
        const json = await callApiMethod('disconnect', {connectionId});
        return json;
    }

    return {connect, disconnect};

}