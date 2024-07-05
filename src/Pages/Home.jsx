import { Row, Col, Container, Image, Card, Dropdown} from "react-bootstrap";

const Home = () => {
    return (
        <>
            <Container>
                <Row>
                    <Col className="text-center">
                        <Card className="text-dark border-dark mb-3" style={{backgroundColor:"#f0f0f0"}}>
                            <Card.Title style = {{color:"navy" , padding:'1vh'}}>Mission Statement</Card.Title>
                            <Card.Body >
                            The main purpose of this application is to help first generation students, and more generally
                            any incoming students acclimate to the college environment, which they are likely to be unfamiliar with.
                            </Card.Body >
                        </Card>
                        <Card className="text-dark border-dark mb-3" style={{backgroundColor:"#f0f0f0"}}>
                            <Card.Title style = {{color:"navy" , padding:'1vh'}}>Features</Card.Title>
                            <Card.Body>
                             <b>Forums:</b> Our forum feature enables students to create
                             posts about various topics and questions.
                            <br></br>
                            <b>Chat:</b> Our chat feature allows for a personal connection
                             between students so that they can have a space for questions tailored for
                             individuals
                            <br></br>
                            <b>Form assistance:</b> An LLM powered essay and form helper 
                            that allows students to get personalized help with some of the
                            more common paperwork they will have to complete.
                            </Card.Body>
                        </Card>
                    </Col>   

                        


                    <Col className="text-center">
                        <br></br>
                        <br></br>
                        <Image src="./src/assets/logo.png" width="300vw" roundedCircle fluid />

                        <Card className="text-dark border-dark mb-3" style={{backgroundColor:"#f0f0f0"}}>
                            <Card.Body>
                                <Card.Title style = {{color:"navy"}}>Resources</Card.Title>
                                <Dropdown>
                                    <Dropdown.Toggle variant="primary" style={{backgroundColor: 'navy', borderColor:'navy', color: 'white'}}>
                                        Internal & External resources
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://studentaid.gov/" target="_blank">FAFSA</Dropdown.Item>
                                        <Dropdown.Item href="https://www.acha.org/ACHA/Resources/Topics/MentalHealth.aspx">Mental Health Resources</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                </Row>
            </Container>
        </>
    );
}

export default Home;