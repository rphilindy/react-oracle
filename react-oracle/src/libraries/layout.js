import API from './mock-api';
import connectionConfig from "../config/connections.json";
import SaveModalContent from '../components/SaveModalContent';

export default function LayoutFuncs() {

    const api = API();

    const disconnect = async (args) => {

        const {connectionId, setConnectionStatus, setModal, setResultText} = args;
        /////disconnect if connected
        if(connectionId.current) {
            setConnectionStatus('disconnecting');
            const json=await api.disconnect(connectionId);
            if(json.error) {
                setConnectionStatus('connected');
                setModal({heading: 'Disconnect Error', content: json.error.message});
                setResultText(json.error.message);
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
        const {selectedConnection, connectionId, setConnectionStatus, setModal, setSelectedConnection, setResultText} = args;
        if(selectedConnection && connectionId.current === null) {
            //show connecting status and connect
            setConnectionStatus('connecting');
            const json=await api.connect(selectedConnection);

            //connect failure
            if(json.error) {
                setConnectionStatus('disconnected');
                setModal({heading: 'Connect Error', content: json.error.message});
                setResultText(json.error.message);
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

        const {connectionId, editorMethods, setModal, setResultBarText, setExecResult} = args;
        setExecResult(null);
        setResultBarText("Executing...");
        const {sql} = editorMethods.current.getSqlAndStart();
        const json = await api.execute(connectionId, sql);
        const {error, span} = json;
        if(error) {
            const {message, position} = error;
            editorMethods.current.highlightErrorAtPosition(position);
            setModal({heading: "SQL Error", content: message});
            setResultBarText(message);
        }
        else {
            setResultBarText(`Executed in ${timeSpanText(span)}`);
        }
        setExecResult(json);
    }

    const handleQueryClick = (querydef, querysetdef, args) => {
        const {editorMethods, setSelectedConnection} = args;

        editorMethods.current.setSql(querydef.sql);

        const connection = querydef.connection || querysetdef.connection;

        if(connection) {
            const conn = connectionConfig.filter(c=>`${c.user}@${c.server}`.toUpperCase() === connection.toUpperCase())[0];
            if(conn) setSelectedConnection(conn);
        }

    }

    //todo: for now the querydef is hardcoded
    const handleSaveClick = async(args) => {

        const {editorMethods, setModal, selectedConnection, setQueries, queries} = args;

        const content = <SaveModalContent queries={queries}/>

        const buttons = [
            {text: 'OK', onClick: ()=>alert()},
            {isClose: true, text: 'Cancel'}
        ];

        setModal({heading: 'Save', content, buttons});


        // const sql = editorMethods.current.getSqlAndStart().sql;
        // const json=await api.saveQuery("Test", "test", {sql, connection: selectedConnection ? `${selectedConnection.user}@${selectedConnection.server}` : undefined});
        // if(json.error)
        //     setModal({heading:'error', connect: json.error});
        // setQueries({...json.queries}); //make sure state updates
    }

    return {disconnect, connect, execute, handleQueryClick, handleSaveClick, getConnections, getQueries };
}