export default function LayoutFuncs() {

    const disconnect = async (connectionId, setConnectionStatus, api, setModal) => {

        /////disconnect if connected
        if(connectionId.current) {
            setConnectionStatus('disconnecting');
            const json=await api.disconnect(connectionId.current);
            if(json.error) {
                setConnectionStatus('connected');
                setModal({heading: 'Disconnect Error', content: json.error});
                return;
            }
        }
        setConnectionStatus('disconnected');
        connectionId.current = null;

    }

    //connect if connect selected and not connected 
    const connect = async (selectedConnection, connectionId, setConnectionStatus, api, setModal, setSelectedConnection) => {

        if(selectedConnection && connectionId.current === null) {
            //show connecting status and connect
            setConnectionStatus('connecting');
            const json=await api.connect(selectedConnection);

            //connect failure
            if(json.error) {
                setConnectionStatus('disconnected');
                setModal({heading: 'Connect Error', content: json.error});
                setSelectedConnection(null);
                
            }

            //success
            else {
                connectionId.current = json.connectionId;
                setConnectionStatus('connected');
            }
        }

    }

    return {disconnect, connect};
}