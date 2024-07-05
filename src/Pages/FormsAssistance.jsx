import { Row, Col, Container, Image, Card, Dropdown} from "react-bootstrap";

const Home = () => {
    return (
        <>
            <Container>
                <Row>
                    <Col className="text-center">
                    <Card className="bg-white text-dark border-dark mb-3">
                            <Card.Body>
                                <Card.Title style = {{color:"navy"}}>FAFSA</Card.Title>
                                <Dropdown className = "mb-3">
                            


                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}  >
                                        What is it?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    The Free Application for Federal Student Aid (FAFSA) is a form that students in the United States can fill out annually to apply for federal financial assistance for higher education. This aid can include grants, scholarships, work-study funds, and loans.
The information provided on the FAFSA helps determine how much financial aid a student is eligible to receive based on their financial need. Students must fill out the FAFSA each year they are enrolled in college or career school to continue receiving financial aid. 

                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        What is needed from you?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    <div style={{ padding: "10px" }}>
                                    
            <h5>What is needed from you?</h5>
            <ul>
                <li>Personal Information:
                    <ul>
                        <li>Your Social Security Number (SSN)</li>
                        <li>Your name</li>
                        <li>Your date of birth</li>
                        <li>Your mailing address and email address</li>
                        <li>Your phone number</li>
                    </ul>
                </li>
                <li>Dependency Status Information: This determines you're considered an independent student and need information about your parents</li>
                <li>Parental Information :
                    <ul>
                        <li>Your parents' Social Security Numbers</li>
                        <li>Your parents' dates of birth</li>
                        <li>Your parents' marital status</li>
                        <li>Your parents' financial information</li>
                    </ul>
                </li>
                <li>Financial Information:
                    <ul>
                        <li>Tax returns, W-2 forms, and bank statements</li>
                        <li>If you are married, your spouse's details as well </li>
                    </ul>
                </li>
                <li>School Selection: You'll need to list the schools to which you want your FAFSA information sent and have the Federal School Code for each institution.</li>
            </ul>
        </div>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        When to do it?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    The federal deadline for completing the FAFSA is June 30, but it is important to check the deadline specific to you university
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className="mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        Useful Links
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://studentaid.gov/h/apply-for-aid/fafsa">FAFSA Application</Dropdown.Item>
                                    </Dropdown.Menu>
                                    
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        Source
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://studentaid.gov/apply-for-aid/fafsa/filling-out">FAFSA Information</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Card.Body>
                        </Card>
                        <Card className="bg-white text-dark border-dark mb-3">
                            <Card.Body>
                                <Card.Title style = {{color:"navy"}}>CSS Profile</Card.Title>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        What is it?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    The CSS Profile, short for the College Scholarship Service Profile, is an online application created and maintained by the United States-based College Board that allows incoming and current college students to apply for non-federal financial aid
                                    and collects detailed information about a student's family finances, including income, assets, expenses, and household size. It may also ask about special circumstances that may affect the family's ability to contribute to college expenses.

                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        What is needed from you?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    <div style={{ padding: "10px" }}>
                                    <ul>
                <li>Personal Information:
                    <ul>
                        <li>Your Social Security Number (SSN)</li>
                        <li>Your name</li>
                        <li>Your date of birth</li>
                        <li>Your mailing address and email address</li>
                        <li>Your phone number</li>
                    </ul>
                </li>

                <li>Financial Information:
                    <ul>
            
                        <li>recently completed tax returns, W-2 forms and other records of current year income, records of untaxed income and benefits, assets, and bank statements.</li>
    
                    </ul>
                </li>
                <li>Household Information:
                    <ul>
                        <li>Information about other members of your household, including siblings and anyone else who lives with you and receives more than half of their support from you or your parents</li>
                    </ul>
                </li>
                <li>School Selection: You'll need to list the schools to which you want your CSS Profile information sent.</li>
    
            </ul>
        </div>

                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        When to do it?
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    The CSS Profile becomes available each year in the fall, typically around October 1st, for the upcoming academic year. It's essential to check the specific deadlines for each college or university to which you plan to apply, as they may vary

                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        Useful links
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://cssprofile.collegeboard.org/">CSS Profile Application</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className = "mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        Source
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://cssprofile.collegeboard.org/">CSS Profile Information</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Card.Body>
                        </Card>
                        

                        <Card className="bg-white text-dark border-dark mb-3">
                            <Card.Body>
                                <Card.Title style = {{color:"navy"}}>Scolarship Information</Card.Title>
           
                                <Dropdown className="mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        General Information
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                    <div style={{ padding: "10px" }}>
                    <h5>General Information</h5>
                    <ul>
                        NOTE: There are many types of scholarship forms and each form is heavily dependent on the university that you decide to attend, but there are general guidelines for all the forms listed below 
                        <li>Scholarship Application Form: This is a basic form that collects personal information about the applicant, such as name, address, contact information, educational background, and sometimes demographic information. It may be a paper form or an online application.</li>
                        <li>Essay or Personal Statement: Many scholarships require applicants to write an essay or personal statement. In some cases, the essay may present you with a particular prompt, such as “What are your plans if you win this award?” or “Why do you deserve to win?”. Others may be more open-ended or allow you to write about anything you wish.</li>
                        <li>Letters of Recommendation: Some scholarship applications require one or more letters of recommendation from teachers, counselors, employers, or other individuals who can speak to the applicant's character and acheivements.</li>
                        <li>Transcripts</li>
                        <li>Resume or CV: Applicants may be asked to submit a resume or curriculum vitae (CV) detailing any work experience, honors or awards they might have aquired</li>
                        <li>Financial Information: Some scholarships are need-based and require applicants to provide information about their family's financial situation, such as income, assets, and household size.</li>
                        <li>Proof of Eligibility: Certain scholarships may have specific eligibility criteria to make sure you qualify for their particular application</li>
                        
                    </ul>
                </div>

                                    </Dropdown.Menu>
                                </Dropdown>
                                <Dropdown className="mb-3">
                                    <Dropdown.Toggle variant="primary" style={{color: "white",width: "60%"}}>
                                        Source
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="https://www.collegeraptor.com/paying-for-college/articles/scholarship-search-applications/information-required-for-scholarship-applications/
">Scholarship Information</Dropdown.Item>
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