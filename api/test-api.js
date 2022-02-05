//import fetch from 'node-fetch';            //add fetch to Node
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var assert = require('assert');

const urlBase="http://localhost:3001/";  


const callApiMethod = async (endpoint) => {
    const response = await fetch(`${urlBase}${endpoint}`);
    const json = await response.json();
    return json;
}

(async () => {

    //these functions are written into the anonymous async function for ease of scripting/ clarity

    //wait for the API to come alive when using as part of npm test (with concurrent)
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const waitForApi = async (timeout) => {

        const quitTime = (new Date()).getMilliseconds() + timeout;
        while((new Date()).getMilliseconds() < quitTime) {
            try {
                await sleep(1000);
                await callApiMethod('hello');
                return;
            }
            catch(e) {
            }
        }
    }
    await waitForApi(30000);

    
    console.log("Starting API Test");

    
    //hit the hello method as a sample
    const testHelloWorld = async () => {
        const json = await callApiMethod('hello');
        assert(json.message === 'hello');
    }
    await testHelloWorld();

    
    
    console.log("Completed API Test");

})();
