const express = require("express");                 //api functionality
const cors = require("cors");                       //CORS functionality
const bodyParser = require("body-parser");          //parse JSON bodies
const PORT = process.env.port || 3001;              //express listener port
const api = express();                              //
api.use(express.json());                            //use JSON
api.use(cors({origin:'http://localhost:3000'}));    //CORS allowed hosts

//a HELLO to get started with API
api.get("/hello", (req, res) => {res.json({message:'hello'})});



//this runs the API
api.listen(PORT, ()=>{console.log('API listening on port ' + PORT)});
