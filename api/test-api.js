//import fetch from 'node-fetch';            //add fetch to Node
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var assert = require('assert');

const urlBase="http://localhost:3001/";  


(async () => {

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const waitForApi = async (timeout) => {

        const quitTime = (new Date()).getMilliseconds() + timeout;
        while((new Date()).getMilliseconds() < quitTime) {
            try {
                await sleep(1000);
                await fetch(`${urlBase}hello`);
                return;
            }
            catch(e) {
            }
        }
    }
    await waitForApi(30000);

    console.log("Starting API Test");

    const testHelloWorld = async () => {
        const response = await fetch(`${urlBase}hello`);
        const json = await response.json();
        assert(json.message === 'hello');
    }
    await testHelloWorld();

    console.log("Completed API Test");

})();
