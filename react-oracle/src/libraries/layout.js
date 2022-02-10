import API from './mock-api';

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
        const {sql, startPos} = editorMethods.current.getSqlAndStart();
        const json = await api.execute(connectionId, sql);
        const {error, span, results} = json;
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

    return {disconnect, connect, execute};
}