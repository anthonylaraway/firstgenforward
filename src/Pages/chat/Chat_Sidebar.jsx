import { useEffect, useState } from 'react';
import { Nav, Card, Container } from 'react-bootstrap'


const Sidebar = () => {

    let [chats, setChats] = useState([]);

    useEffect(() => {
        async function GetChats() {
            let response = await fetch('http://localhost:8080/chats', {
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Internal error');
            }
            let data = await response.json();
            chats = data.chats
            setChats(data.chats);
        }

        GetChats();
    }, [])

    return (
        <Card className='sidebar_card'>
            <Container>
                <Nav defaultActiveKey="/chat" className="flex-column">
                    <Nav.Link href="/chat" className='topbar_links'>Home</Nav.Link>
                    <Nav.Link href='/chat/friends' className='topbar_links'>Friends</Nav.Link>
                    <hr className='sidebar_hr'/>
                    {chats == null 
                    ? 
                        null 
                    :
                        chats.map((chat) => {
                            let fullpath = '/setUpChat/' + chat.id;
                            return <Nav.Link className='topbar_links' key={chat.id} href={fullpath}>{chat.friend}</Nav.Link>
                    })}
                </Nav>
            </Container>
        </Card>
    )
}

export default Sidebar;