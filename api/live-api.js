const oracledb = require('oracledb');



const fs = require('fs');
const express = require("express");                 //api functionality
const cors = require("cors");                       //CORS functionality
const bodyParser = require("body-parser");          //parse JSON bodies
const PORT = process.env.port || 3001;              //express listener port
const api = express();                              //
api.use(express.json());                            //use JSON
api.use(cors({origin:'http://localhost:3000'}));    //CORS allowed hosts

//connections are stored with some unique id
let connections = {};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//a HELLO to get started with API
api.get("/hello", (req, res) => {res.json({message:'hello'})});


//connect: accepts connection data, returns {connectionId: id, timeSpan: ms} or {error: 'message'}
api.post("/connect",  async (req,res) => {
    const connectionId = (new Date()).getTime();
    const conn = req.body.connection;
    try {
        const start = new Date();
        let connection = await oracledb.getConnection({
            user: conn.user,
            password: conn.password ,
            connectString: conn.server
        });
        connections[connectionId] = {connection, cursors: {}};
        const timeSpan = (new Date()) - start;
        res.json({connectionId, timeSpan});
    }
    catch (e) {
        res.json({error: {message: e.message}});
    }

});

//connect: accepts connectionid, returns {timeSpan: ms} or {error: 'message'}
api.post("/disconnect",  async (req,res) => {

    const {connectionId} = req.body;

    if(!connectionId || !connections[connectionId]) {
        res.json({error: {message: 'no such connection'}});
        return;
    }

    try {
        const start = new Date();
        await connections[connectionId].connection.close();
        delete connections[connectionId];
        const timeSpan = (new Date()) - start;
        res.json({timeSpan});
    }
    catch(e){
        res.json({error: {message: e.message}});
    }

});

api.post("/execute",  async (req,res) => {

    const {connectionId, sql, params} = req.body;

    if(!connectionId || !connections[connectionId]) {
        res.json({error: {message: 'no such connection'}});
        return;
    }

    const connection = connections[connectionId];

    const stmts = parse(sql);

    let json = {results: []};

//            json.results.push({sql: stmt, span: 23, cursors: [{
            //     name: 'cursor1' ,
            //     id: id,
            //     columns: mock.columns,
            // }]});

//            json.results.push({sql: stmt, error:{message: 'No such mock data'}, span: 23});
//            if(!json.error) json.error = {message: 'No such mock data', position: 0};

    const start = new Date();
    for(let stmt of stmts) {

        if(!json.error) {

            let result = {sql: stmt};
            const hasResult = sql.search(/^\s*SELECT/i) !== -1;
            const qstart = new Date();
            try {
                const qresult = await connection.connection.execute(stmt, {}, { resultSet: hasResult, extendedMetaData: hasResult });
                result.timeSpan = (new Date()) - qstart;

                if(hasResult) {
                    const cursorid = qstart.getTime();
                    const cursorname = "Result";
                    
                    console.log(qresult.metaData);
                    const columns = qresult.metaData.map(m => ({name: m.name, type: `${m.dbTypeName}${m.precision ?`(${m.precision})`:''}${m.byteSize ?`(${m.byteSize})`:''}${m.nullable?'':' NOT NULL'}`}));
                    
                    connection.cursors[cursorid] = qresult.resultSet;
                    result.cursors = [{name: cursorname, id: cursorid, columns}];
                }
                else {
                    result.affected = qresult.rowsAffected;
                }
            }
            catch (e) {
                result.timeSpan = (new Date()) - qstart;
                result.error = {message: e.message, position: e.offset};
                json.error = result.error;
            }

            json.results.push(result);
        }
    }

    json.timeSpan = (new Date()) - start;
    res.json(json);

});


const parse = (sql) => {

    let stmt = '';
    let stmts = [];

    while(sql.length) {

        const semi = sql.search(';');
        let str = sql.search("'");

        //no more ;'s, take remainder
        if(semi === -1){
            stmt = sql;
            sql='';
            if(stmt.search(/\s/) !== -1)
                stmts.push(stmt);
            stmt = '';    
        }

        //read string before semicolon
        else if(str > -1 && str < semi) {

            //take '
            stmt += sql.substring(0, str+1);
            sql = sql.substring(str+1);
            while(sql.length){
                str = sql.search("'");

                //no closing '
                if(str === -1)
                    break;

                    //part of '', take both
                else if(sql[str + 1] === "'"){
                    stmt += sql.substring(0, str+2);
                    sql = sql.substring(str+2);
                }

                //string close
                else {
                    stmt += sql.substring(0, str+1);
                    sql = sql.substring(str+1);
                    break;
                }
            }
        }

        //read to next ;
        else {
            stmt += sql.substring(0,semi);
            sql=sql.substring(semi+1);
            if(stmt.search(/\s/) !== -1)
                stmts.push(stmt);
            stmt = '';    
        }

    }

    return stmts;

};


//this runs the API
api.listen(PORT, ()=>{console.log('API listening on port ' + PORT)});


