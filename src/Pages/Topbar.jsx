import { Card, Modal, Container, Navbar, Nav, NavDropdown, Form, Button } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Booleans for when users log in successfully will be needed. Things in the topbar may change depending on if a user is signed in.
const Topbar = ({ username, isSignedIn, changeIsSignedIn }) => {

    let [showDelete, setShowDelete] = useState(false);
    let handleCloseDelete = () => setShowDelete(false);
    let handleShowDelete = () => setShowDelete(true);
    let navigate = useNavigate();

    function LogOut() {
        fetch ("http://localhost:8080/logout")
        .then ((response) => {
            if (!response.ok) {
                throw new Error("Login Failed!");
            }
            else {
                Cookies.remove('mysession');
                Cookies.remove('Username');
                Cookies.remove('UserID');
                changeIsSignedIn(false);
            }
            navigate('/');
        })
    }

    function DispLogin() {
        if (!isSignedIn) {
            return (
                <Nav.Link href='/user/login' style = {{color:"white",fontWeight: 'bold'}}>Log in</Nav.Link>
            );
        }
        return (
            <NavDropdown bsPrefix='testing' data-bs-theme='dark' drop='start' className='dropdown_profile' title={
                <span style={{color:'white', fontWeight:'bold'}}>{Cookies.get('Username')}</span>}>
                <NavDropdown.ItemText>{Cookies.get('Username')}</NavDropdown.ItemText>
                <NavDropdown.Divider/>
                <NavDropdown.Item onClick={LogOut}>Log Out</NavDropdown.Item>
                <NavDropdown.Item onClick={handleShowDelete}>Delete Account</NavDropdown.Item>
            </NavDropdown>
        );
    }

    function DeleteAccount() {

        let fullPath = "http://localhost:8080/user/" + Cookies.get('UserID');
        console.log(fullPath);
        fetch (fullPath, {
            method: "DELETE",
            credentials: 'include'
        })
        .then ((response) => {
            if (!response.ok) {
                throw new Error("Delete Account Failed!");
            }
            else {
                Cookies.remove('mysession');
                handleCloseDelete();
                changeIsSignedIn(false);
            }
            navigate('/')
        })
    }

    return (
        <>
        
        <Navbar collapseOnSelect expand='lg' className='home_topbar'>
            <Container fluid>
                <Navbar.Brand href='/' className='topbar_links'>FirstGenForward</Navbar.Brand>
                <Navbar.Toggle aria-controls="coll" />
                <Navbar.Collapse id="coll">
                    <Nav className='me-auto'>
                        <Nav.Link href='/essay' className='topbar_links'>Essay Assistance</Nav.Link>
                        <Nav.Link href='/chat' className='topbar_links'>Chat</Nav.Link>
                        <Nav.Link href='/about_us' className='topbar_links'>About us</Nav.Link>
                        <Nav.Link href='/formsassistance' className='topbar_links'>Forms Assistance</Nav.Link>
                    </Nav>
                    <Nav className='topbar_nav'>
                        <DispLogin/>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <Modal show={showDelete} onHide={handleCloseDelete}>
            <Modal.Header closeButton>
                <Modal.Title>Delete Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Text>
                        Are you sure you want to delete your account? This action is irreversible.
                    </Form.Text>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={DeleteAccount}>
                    Delete Account
                </Button>
                <Button variant="secondary" onClick={handleCloseDelete}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );

}

export default Topbar;