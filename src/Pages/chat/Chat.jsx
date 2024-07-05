import { Row, Col, Container, Card} from 'react-bootstrap'
import { useEffect, useState } from 'react';
import Sidebar from './Chat_Sidebar'
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader} from "@chatscope/chat-ui-kit-react";

const Chat = (params) => {
    let [messages, setMessages] = useState([]);
    let fullpath = 'http://localhost:8080/chat/' + params.roomId;
    let ws = params.ws;
    let [friend, setFriend] = useState('');

    useEffect(() => {
        async function GetChatHistory() {
            if (params.roomId == undefined) {
                return
            }
            let response = await fetch(fullpath, {
                credentials: 'include',
            })
            if (!response.ok) {
                throw new Error('Internal Error.');
            }
            let data = await response.json();
            setMessages(data.messages);
            setFriend(data.friend);
        }

        GetChatHistory();
    }, [])

    async function SendMessage(message) {
        let newMessage = {
            message,
            sentTime: 'just now',
            sender: params.myUn,
            direction: 'outgoing'
        }

        let requestData = {message: message};
        let response = await fetch(fullpath, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(requestData)
        })
        if (!response.ok) {
            throw new Error('Internal Error');
        }

        let socketData = {
            message: newMessage.message,
            name: params.myUn,
            room_id: params.roomId
        }
        ws.send(JSON.stringify(socketData));
    }

    params.ws.onmessage = (event) => {
        let parsedData = JSON.parse(event.data);

        let actualMsg = parsedData.message;
        let author = parsedData.name;
        let dir = 'incoming'

        if (author === params.myUn) {
            dir = 'outgoing'
        }

        let newMessage = {
            message: actualMsg,
            sentTime: "just now",
            sender: author,
            direction: dir
        }
        if (messages == null) {
            setMessages([newMessage]);
        }
        setMessages([...messages, newMessage]);
    };

    return (
        <Container className='forum_container'>
            <Card className='chat_card'>
                <Row>
                    <Col style={{paddingRight:0, paddingLeft:0}} md='auto'>
                        <Sidebar/>
                    </Col>
                    <Col style={{paddingLeft:0}}>
                    {/* <div style={{ backgroundColor:'white' ,textAlign:'center', height:"40px", paddingBottom:"1vh"}}>
                        <h3 style={{color:'navy'}} >Chatting with {friend}</h3>
                    </div> */}
                        <div style={{ position: "relative", height: "600px"}}>
                            <MainContainer className='essay_form_comp'>
                                <ChatContainer>
                                <ConversationHeader>
                                    <ConversationHeader.Content userName={friend}>
                                    </ConversationHeader.Content>
                                </ConversationHeader>
                                {messages == null 
                                ? null 
                                :
                                    <MessageList>
                                        {messages.map((message) => {
                                            return (
                                            message.sender === params.myUn 
                                            ?
                                                <Message key={message.id} model={message}/>
                                            :
                                                <Message key={message.id} model={{
                                                    message: message.message,
                                                    sender: message.sender,
                                                    direction: 'incoming'
                                                }}/>
                                            )
                                        })}
                                    </MessageList>
                                }
                                <MessageInput placeholder="Type message here" attachButton={false} onSend={SendMessage}/>
                                </ChatContainer>
                            </MainContainer>
                        </div>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}

export default Chat;