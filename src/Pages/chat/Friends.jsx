import { Container, Button, Card, Row, Col, Modal, Form} from 'react-bootstrap'
import Sidebar from './Chat_Sidebar'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Friends = () => {

    let [showFriendModal, setShowFriendModal] = useState(false);
    let [friendToAdd, setFriendToAdd] = useState('');
    let [friendToAddErr, setFriendToAddErr] = useState('');
    let [allUsers, setAllUsers] = useState([]);
    let [friends, setFriends] = useState([]);
    let [friendReqs, setFriendReqs] = useState([]);
    let navigate = useNavigate();


    useEffect(() => {
        async function GetAllUsers() {
            let response = await fetch('http://localhost:8080/users', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Internal error');
            }
            let data = await response.json();
            allUsers = data.users;
            setAllUsers(allUsers);
        }

        async function GetFriends() {
            let response = await fetch('http://localhost:8080/friends', {
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Internal error');
            }
            let data = await response.json();
            friends = data.users;
            setFriends(friends);
        }

        async function GetFriendReqs() {
            let response = await fetch ('http://localhost:8080/friendreq', {
                credentials: 'include'
            })
            if (!response.ok) {
                throw new Error('Internal error');
            }
            let data = await response.json();
            friendReqs = data.users;
            setFriendReqs(friendReqs);
        }

        GetAllUsers();
        GetFriends();
        GetFriendReqs();
    }, []);

    function FriendCard(friendObj) {
        return (
            <Card className='friend_card'>
                <Row>
                    <Card.Title style={{textAlign:'center', paddingTop:"1vh"}}>{friendObj.friend.name}</Card.Title>
                </Row>
                <Card.Body className='friend_card_body'>
                    <Row>
                        <Col md='auto'>
                            <Button className='friend_card_button' variant='outline-primary' onClick={() => HandleChat(friendObj.friend.id)}>Message</Button>
                        </Col>
                        <Col style={{textAlign: 'right'}}>
                            <Button className='friend_card_button' variant='outline-danger' onClick={() => DeleteFriend(friendObj.friend.id)}>Delete</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }

    function FriendReqCard(friendReqObj) {
        return (
            <Card className='friend_req_card'>
                <Row>
                    <Card.Title style={{textAlign:'center', paddingTop:'1vh'}}>{friendReqObj.friendReq.name}</Card.Title>
                </Row>
                <Card.Body className='friend_card_body'>
                    <Row>
                        <Col md='auto'>
                            <Button className='friend_card_button' variant='outline-primary' onClick={() => AddFriend(friendReqObj.friendReq.id)}>Accept</Button>
                        </Col>
                        <Col style={{textAlign: 'right'}}>
                            <Button className='friend_card_button' variant='outline-danger' onClick={() => DenyRequest(friendReqObj.friendReq.id)}>Reject</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }

    async function AddFriend(userId) {
        let requestData = { id : userId };
        try {
          await fetch('http://localhost:8080/friendreq', {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify(requestData)
          })
            .then((response) => {
              if (response.status != 200) {
                setFriendToAddErr('');
              }
              else {
                window.location.reload();
              }
            });
        }
        catch (error) {
          setFriendToAddErr(error.message);
        }
    }

    function FriendSearch() {

        let currSearchInd = friendToAdd.length;
        if (friendToAdd != '') {
            return (
                <>
                    {allUsers.map((user) => 
                        user.name.toLowerCase().substring(0, currSearchInd).includes(friendToAdd.toLocaleLowerCase()) ?
                        <Button>{user.name}</Button>
                        : null
                    )}
                </>
            )
        }
        else {
            return (
                <>
                    {allUsers.map((user) =>
                        <Button onClick={() => AddFriend(user.id)} className='user_buttons'>{user.name}</Button>
                    )}
                </>
            )
        }
    }

    async function DenyRequest(userId) {
        let requestData = { id : userId };
        try {
          await fetch('http://localhost:8080/friendreq', {
            credentials: 'include',
            method: "DELETE",
            body: JSON.stringify(requestData)
          })
            .then((response) => {
              if (response.status != 200 && response.status != 204) {
                setFriendToAddErr('');
              }
              else {
                window.location.reload();
              }
            });
        }
        catch (error) {
          setFriendToAddErr(error.message);
        }
    }

    async function DeleteFriend(userId) {
        let requestData = { id : userId }

        try {
            await fetch('http://localhost:8080/friends', {
              credentials: 'include',
              method: "DELETE",
              body: JSON.stringify(requestData)
            })
              .then((response) => {
                if (response.status != 200 && response.status != 204) {
                  setFriendToAddErr('');
                }
                else {
                  window.location.reload();
                }
              });
          }
          catch (error) {
            setFriendToAddErr(error.message);
          }
    }

    async function HandleChat(userId) {

        let requestData = {id: userId};

        if (userId == undefined) {
            return
        }
        let response = await fetch('http://localhost:8080/chat', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(requestData)
        })
        if (!response.ok) {
            throw new Error('Internal Error.');
        }
        let data = await response.json();
        let roomId = data.message;

        let fullpath = '/setUpChat/' + roomId;
        navigate(fullpath);
    }

    return (
        <>
            <Container>
                <Card className='friends_card' style={{backgroundColor:'#f0f0f0', padding:'2vh'}}>

                    <Row>
                        <Col md='auto'>
                            <Sidebar/>
                        </Col>

                        <Col>
                            <Row>
                                <Col md='auto'>
                                    <Card.Title style={{textAlign:'center', fontSize:30}}>Friends List</Card.Title>
                                </Col>
                                <Col style={{textAlign:'right'}}>
                                    <Button style={{backgroundColor:'navy'}} onClick={() => setShowFriendModal(true)}>Add New Friend</Button>
                                </Col>
                            </Row>
                            
                            <hr/>

                            {friendReqs == null ? null :
                                <>
                                <Row>
                                    <Card.Title style={{textAlign:'center'}}>Friend Requests</Card.Title>
                                </Row>

                                <Row md={3} sm={2}>
                                    {friendReqs.map((friendReq =>
                                        <Col>
                                        <FriendReqCard friendReq={friendReq}/>
                                        </Col>
                                    ))}

                                </Row>

                                <hr/>
                                </>
                            }
                            <Row>
                                {friends == null ? null
                                :
                                <>
                                <Card.Title style={{textAlign:'center'}}>Friends</Card.Title>
                                <Row md={3} sm={2}>
                                    {friends.map((friend =>
                                        <Col>
                                            <FriendCard friend={friend}/>
                                        </Col>
                                    ))}
                                </Row>
                                </>

                                }
                            </Row>
                        </Col>
                    </Row>
                </Card>
            </Container>

            <Modal show={showFriendModal} onHide={() => setShowFriendModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add A Friend</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="recovery">
                            <Form.Label>Enter Username</Form.Label>
                            <Form.Control
                                type="email"
                                autoFocus
                                onChange={(e) => setFriendToAdd(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                    <hr/>
                    <FriendSearch/>
                </Modal.Body>
                {friendToAddErr && <p style={{ color: 'red' }}>{friendToAddErr}</p>}
            </Modal>
        </>
    )
}

export default Friends;