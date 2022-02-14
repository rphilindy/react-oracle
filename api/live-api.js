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
        connections[connectionId] = connection;
        const timeSpan = (new Date()) - start;
        console.log({connectionId, timeSpan});
        res.json({connectionId, timeSpan});
    }
    catch (e) {
        res.json({error: {message: e.message}});
    }

});

//connect: accepts connectionid, returns {timeSpan: ms} or {error: 'message'}
api.post("/disconnect",  async (req,res) => {
    console.log("API disconnect");
    const {connectionId} = req.body;
    console.log(req.body);

    if(!connectionId || !connections[connectionId]) {
        res.json({error: {message: 'no such connection'}});
        return;
    }

    try {
        await connections[connectionId].close();
        delete connections[connectionId];
    }
    catch(e){
        res.json({error: {message: e.message}});
    }

    const timeSpan = 1000   ;
    await sleep(timeSpan);
    delete connections[connectionId];
    res.json({timeSpan});
});

//this runs the API
api.listen(PORT, ()=>{console.log('API listening on port ' + PORT)});
