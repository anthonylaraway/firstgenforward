import { Stack, Card, Form, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom"
import { useState } from "react";

const Create_Profile = () => {
    
    let navigate = useNavigate();
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [confirmPassword, setConfirmPassword] = useState('');
    let [username, setUsername] = useState('');
    let [createAccountError, setCreateAccountError] = useState('');


    async function PostToDatabase() {
        event.preventDefault();

        if (username.length > 20 || username.length < 2) {
            setCreateAccountError('Usernames must be between 2 and 20 characters')
            return;
        }

        if (password != confirmPassword) {
            setCreateAccountError('Passwords must match')
            return;
        }

        let requestData = {name: username, email: email, pass: password};

        try {
            await fetch ('http://localhost:8080/signup', {
                method: "POST",
                body: JSON.stringify(requestData)
            })
                .then ((response) => {
                    if (response.status == 409) {
                        setCreateAccountError('Email or username already in use');
                    }
                    else {
                        navigate('/user/login')
                    }
                });
            }
        catch (error){
            setCreateAccountError(error.message);
        }
    }

    function CreateAccountButton() {
        if ((email != '' && email.includes('@')) && password != '' && confirmPassword != '' && username != '') {
            return <Button type="submit">Create Account</Button>
        }
        else {
            return <Button disabled>Create Account</Button>
        }
    }
    
    return (
    <Container style={{width: 800}}>
        <Card style={{backgroundColor: '#c7c7c7'}}>
            <Card.Header as='h4' style={{textAlign: 'center'}}>Create An Account</Card.Header>
            <Stack gap={2}>
                <Form onSubmit= {PostToDatabase}>

                    <Form.Group className="create_account_form" controlId="Email">
                        <Form.Label>Enter your email address</Form.Label>
                        <Form.Control 
                        type='email' 
                        placeholder='Enter email'
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="create_account_form" controlId="Username">
                        <Form.Label>Enter your username</Form.Label>
                        <Form.Control 
                        type='username' 
                        placeholder='Enter username'
                        onChange={(e) => setUsername(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Usernames must be between 2 and 20 characters
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="create_account_form" controlId="Password">
                        <Form.Label>Create a password</Form.Label>
                        <Form.Control 
                        type="password" 
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="create_account_form" controlId="confirmPassword">
                        <Form.Label>Confirm your password</Form.Label>
                        <Form.Control 
                        type="password" 
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Stack style={{justifyContent: 'center'}} direction="horizontal" gap={3}>
                        <CreateAccountButton/>
                        <Button href="/">Cancel</Button>
                    </Stack>
                    {createAccountError && <p style={{ color: 'red' }}>{createAccountError}</p>}
                </Form>
            </Stack>
        </Card>
    </Container>
    );
}

export default Create_Profile;