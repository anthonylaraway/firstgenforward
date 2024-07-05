import Chat from "./Chat";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";

let Testing = () => {
    let roomIdObj = useParams();
    let wsPath = 'ws://localhost:8080/ws/' + roomIdObj.id;
    let myUn = Cookies.get('Username');
    let webSocket = new WebSocket(wsPath);

    return (
        <Chat roomId={roomIdObj.id} myUn={myUn} ws={webSocket} wsPath={wsPath}/>
    );

}

export default Testing