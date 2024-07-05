import React, { useState } from "react";
import { Card, Button, Stack, Form, Container, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

const Login = ({ changeUsername, changeIsSignedIn }) => {
    let navigate = useNavigate();
    let [show, setShowRecovery] = useState(false);
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [loginError, setLoginError] = useState('');
    let handleCloseRecovery = () => setShowRecovery(false);
    let handleShowRecovery = () => setShowRecovery(true);

    let requestData = {email: email, pass: password};

    const handleLogin = async () => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/login', {
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
                throw new Error('Incorrect email or password.');
            }
            const data = await response.json();
            Cookies.set('Username', data.username);
            Cookies.set('UserID', data.id)
            console.log(Cookies.get());
            changeUsername(data.username);
            changeIsSignedIn(true);
            navigate('/');
        } catch (error) {
            setLoginError(error.message);
        }
    };

    function LoginButton() {
        if (email != '' && password != '') {
            return <Button variant="primary" type="submit">Log in</Button>
        }
        else {
            return <Button variant="primary" disabled>Log in</Button>
        }
    }

    return (
        <Container style={{ width: 800}}>
            <Card style={{backgroundColor: '#c7c7c7'}}>
                <Card.Header as='h4' style={{textAlign: 'center'}}>Log in</Card.Header> 
                <Stack gap={2}>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="login_form">
                            <Form.Control
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="login_form">
                            <Form.Control
                                type='password'
                                placeholder='Enter password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        <Stack className="login_stack" direction="horizontal" gap={3}>
                            <LoginButton/>
                            <Button variant='primary' onClick={handleShowRecovery}>
                                Recover Account
                            </Button>
                            <Button variant='primary' href='/user/create_account'>
                                Create Account
                            </Button>
                        </Stack>

                        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
                    </Form>
                </Stack>
            </Card>

            <Modal show={show} onHide={handleCloseRecovery}>
                <Modal.Header closeButton>
                    <Modal.Title>Recover Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="recovery">
                            <Form.Label>Enter Account Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                autoFocus
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseRecovery}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseRecovery}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default Login;