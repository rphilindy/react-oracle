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

    async function execute(connectionId, sql) {
        //const json = await callApiMethod('execute', {connectionId, sql});
        const json = {
            xerror: {message: 'Sample Error', position: 0}, 
            span: 15,
            results: [{
                sql: 'select * from dual',    
                span: 5,
                xaffected: 155,
                cursors: [
                    {name: 'cursor1', 
                    id: 787183746,
                    columns:[
                        {name: 'column1', type: 'varchar2(50)', isLob: false},
                        ]
                    },
                    {name: 'cursor2', 
                    id: 787183747,
                    columns:[
                        {name: 'column2', type: 'varchar2(100)', isLob: false},
                        ]
                    },
                ]
            },{
                sql: "update blah blah",
                span: 11030,
                affected: 1213
            }
            ,{
                sql: "delete blah blah",
                error: "some error message 2",
            }
            ]
        };
        await sleep(500);
        return json;
    }

    async function getRows(connectionId, cursorId, startRow, numRows) {
        //const json = await callApiMethod('get-rows', {connectionId, cursorId, numRows});
        debugger;
        let json = {
            errorx: {message: 'Sample Error'}, 
            //rowCount: ,
            rows: []
        };

        if(startRow < 0){
            startRow = Math.floor(42/numRows) * numRows;
        }

        for(let i=0; i< numRows; ++i) {
            json.rows.push([startRow + i + 1]);
        }

        if(startRow + numRows > 42) {
            json.rowCount = 42;
            json.rows.splice(42 - startRow);
        }
    

        json.startRow = startRow;

        return json;
    }

    return {connect, disconnect, execute, getRows};

}