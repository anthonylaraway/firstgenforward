import {Button, Row, Col, Container, Card, NavDropdown} from 'react-bootstrap'
import Sidebar from './Chat_Sidebar'
import { useEffect, useState } from 'react';

const Chat_Home = () => {
    
    let [chats, setChats] = useState([]);

    useEffect(() => {
        async function getChats() {
            let response = await fetch('http://localhost:8080/chats', {
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Internal Error.');
            }
            let data = await response.json();
            setChats(data.chats);
        }

        getChats();
    }, [])

    function parseDateTime(dateTimeString) {
        var date = new Date(dateTimeString);
        // Get timezone offset
        var offset = date.getTimezoneOffset()
        // Add the timezone offset to the datetime
        const withTimeZone = new Date(date.getTime() + (offset * 60000))
        const formattedDate = withTimeZone.toLocaleString()
        return formattedDate;
    }

    function FriendCard(chatObj) {
        let fullpath = '/setUpChat/' + chatObj.chat.id
        return (
            <Card className='forum_card' style={{paddingTop:'1vh'}}>
                <Card.Title>
                    <Row className="forum_author_name">
                        <Col className="card_col">
                            <Card.Link style={{color:'navy'}} href={fullpath}>{chatObj.chat.friend}</Card.Link>
                        </Col>
                    </Row>
                </Card.Title>
                <footer style={{marginTop:1}} className='blockquote-footer'>
                    {parseDateTime(chatObj.chat.last_updated)}
                </footer>
            </Card>
        );
    }

    return (
        <Container className='forum_container'>
            <Card className='friends_card'>
                <Row>
                    <Col md='auto'>
                        <Sidebar/>
                    </Col>
                    <Col>
                        <Row md={3} sm={2}>
                            { chats == null 
                            ? 
                                <> 
                                    <h1 style={{textAlign:'center'}}>
                                        No Chats
                                    </h1> 
                                    <hr/> 
                                </>
                            :

                                chats.map((chat) => (
                                    <Col>
                                    <FriendCard chat={chat}/>
                                    </Col>

                                ))}
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
}

export default Chat_Home;