//import API from './mock-api';
import API from './api';
import connectionConfig from "../config/connections.json";
import SaveModalContent from '../components/SaveModalContent';

export default function LayoutFuncs() {

    const api = API();

    const disconnect = async (args) => {

        const {connectionId, setConnectionStatus, setModal, setResultBarText} = args;
        /////disconnect if connected
        if(connectionId.current) {
            setConnectionStatus('disconnecting');
            const json=await api.disconnect(connectionId.current);
            if(json.error) {
                setConnectionStatus('connected');
                setModal({heading: 'Disconnect Error', content: json.error.message});
                setResultBarText(json.error.message);
                return;
            }
        }
        setConnectionStatus('disconnected');
        connectionId.current = null;

    }

    const getConnections = async (args) => {
        const {setConnections, setModal} = args;
        let json = await api.getConnections();
        if(json.error) {
            setModal({heading: 'Error', content: json.error});
            return json;
        }

        setConnections(json.connections);
        return json;
    }

    const getQueries = async (args) => {
        const {setQueries, setModal} = args;
        let json = await api.getQueries();
        if(json.error) {
            setModal({heading: 'Error', content: json.error});
            return json;
        }

        setQueries(json.queries);
        return json;
    }


    //connect if connect selected and not connected 
    const connect = async (args) => {
        const {selectedConnection, connectionId, setConnectionStatus, setModal, setSelectedConnection, setResultBarText} = args;
        if(selectedConnection && connectionId.current === null) {
            //show connecting status and connect
            setConnectionStatus('connecting');
            const json=await api.connect(selectedConnection);

            //connect failure
            if(json.error) {
                setConnectionStatus('disconnected');
                setModal({heading: 'Connect Error', content: json.error.message});
                setResultBarText(json.error.message);
                setSelectedConnection(null);
                
            }

            //success
            else {
                connectionId.current = json.connectionId;
                setConnectionStatus('connected');
            }
        }

    }

    const timeSpanText = (ms) => `${ms} ms`;

    const execute = async (args) => {

        const {connectionId, editorMethods, paramsEditorMethods, setModal, setResultBarText, setExecResult} = args;
        setExecResult(null);
        setResultBarText("Executing...");
        
        const {sql} = editorMethods.current.getSqlAndStart();
        const paramsJSON = paramsEditorMethods.current.getSqlAndStart().sql;
        
        let params;
        try{
            params = paramsJSON.trim() === "" ? null : JSON.parse(paramsJSON);
        }
        catch(e){
            const position = e.message?.split(/ at position /)[1];
            if(position !== undefined)
                paramsEditorMethods.current.highlightErrorAtPosition(position);
            setModal({heading: "Params Error", content: e.message});
            return;
        }
        
        const json = await api.execute(connectionId.current, sql, params);
        const {error, timeSpan} = json;
        if(error) {
            const {message, position} = error;
            editorMethods.current.highlightErrorAtPosition(position);
            setModal({heading: "SQL Error", content: message});
            setResultBarText(message);
        }
        else {
            setResultBarText(`Executed in ${timeSpanText(timeSpan)}`);
        }
        setExecResult(json);
    }

    const handleQueryClick = (queryDef, querySetDef, qKey, qsKey, args) => {
        const {editorMethods, setSelectedConnection, selectedQuery} = args;

        editorMethods.current.setSql(queryDef.sql);
        selectedQuery.current = {qsKey, qKey};

        const connection = queryDef.connection || querySetDef.connection;

        if(connection) {
            const conn = connectionConfig.filter(c=>`${c.user}@${c.server}`.toUpperCase() === connection.toUpperCase())[0];
            if(conn) setSelectedConnection(conn);
        }

    }

    const save = async (vals,args) => {

        const {qKey, qsKey} = vals;
        const {setModal, setQueries, editorMethods, selectedConnection} = args;
        setModal(null);
        const sql = editorMethods.current.getSqlAndStart().sql;
        const json=await api.saveQuery(qsKey, qKey, {sql, connection: selectedConnection ? `${selectedConnection.user}@${selectedConnection.server}` : undefined});
        if(json.error)
            setModal({heading:'error', connect: json.error});
        setQueries({...json.queries}); //make sure state updates
    }

    //todo: for now the querydef is hardcoded
    const handleSaveClick = async(args) => {

        const {setModal, queries, selectedQuery} = args;

        let vals={qKey:"", qsKey: ""};

        let buttons = [
            {text: 'OK', onClick: ()=>save(vals, args), disabled: true, isAutoFocus: true},
            {isClose: true, text: 'Cancel'}
        ];

        const onChange=(qsKey, qKey)=> {
            vals = {qsKey, qKey};
            buttons[0].disabled = qsKey.trim() === '' || qKey.trim() === '';
            setModal({heading: 'Save', content, buttons});
        }
        const content = <SaveModalContent queries={queries} selectedQuery={selectedQuery} handleChange={onChange}/>

        setModal({heading: 'Save', content, buttons});


    }

    return {disconnect, connect, execute, handleQueryClick, handleSaveClick, getConnections, getQueries };
}