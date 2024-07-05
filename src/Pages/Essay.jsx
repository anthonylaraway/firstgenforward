import {Container, Card, Row, Col, Form, Button} from 'react-bootstrap';
import React, { useState } from 'react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {MainContainer, ChatContainer, MessageList, Message, MessageInput} from "@chatscope/chat-ui-kit-react";
import pdfToText from 'react-pdftotext'

// const openai = new OpenAI({apiKey: import.meta.env.VITE_API_KEY, dangerouslyAllowBrowser: true})

const apiKey = import.meta.env.VITE_API_KEY

function Essay() {
    const [input, setInput] = useState('')
    const [analyzed, setAnalyzed] = useState(false)
    // const [aiResponse, setAIResponse] = useState('')
    const [messages, setMessages] = useState([
        {
            message:"You will see my responses to your essay and questions here.",
            sentTime:"just now",
            sender:"assistant",
            direction: "incoming"
        }])

    const handleChange = (event) => {
        setInput(event.target.value)
    }

    const sendMessage = async(message) => {
        const newMessage = {
            message,
            sentTime:"just now",
            sender:"user",
            direction:"outgoing"
        }

        setMessages([...messages, newMessage])

        await sendToOpenAI([...messages, newMessage])
    }

    async function sendToOpenAI(messages) {
        const system = {
            role:"system",
            content:"Explain things and give feedback as if you are a teacher or professor."+
            "Only answer questions that relate to the essay that I am going to give. If the question is not"+
            "related to the essay, then tell me that you can't answer it. Make sure to not answer any questions" + 
            "that are not related to the essay."
        }
    
        const chatHistory = messages.map((message) => {
            return {role: message.sender, content: message.message}
        })
    
    
        await fetch("https://api.openai.com/v1/chat/completions", 
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
              system,
              ...chatHistory
            ]
          })
        }).then((response) => {
          return response.json();
        }).then((response) => {
          setMessages([...messages, {
            message: response.choices[0].message.content,
            sentTime:"just now",
            sender:"assistant",
            direction: "incoming"
          }]);
        });


        // const completion = await openai.chat.completions.create({
        //     messages:[system,...chatHistory],
        //     model:"gpt-3.5-turbo",
        //     temperature:0, 
        //     max_tokens:500,  
        //     frequency_penalty:0,
        //     presence_penalty:0,
        //     stop: null
        // })
      }




    async function analyzeButton(){

        setAnalyzed(true)

        const message = "Given this essay" + input + "Give me feedback on each section."+
        "A section is typically paragraph. Please label each section's advice. Include advice about the "+
        "introduction and conclusion sections. Afterwards, I might" +
        "ask you questions. When giving feedback, follow these steps." + 
        "1. Examine the introduction to make sure it is establishing the essay's purpose. Make sure there is a clear thesis statement and that is effective " + 
        "2. Examine the body paragraphs. Analyze each body paragraph individually, but do not assume that each paragraph is a separate idea. "+
        "There may be a multiple paragraphs that explain one idea. Evaluate the strength of each paragraph's " +
        "coherence and relevance to the thesis. Provide suggestions for ideas that will improve the main points covered by each body paragraph." +
        "3. In addition to examining the body paragraphs, make sure to check if the author has included sources to back their claims. Ensure that sources are used effectively and credited successfuly, and if the essay lacks sources or details to back up the arguments, provide examples. Make sure the examples are very specific." +
        "4. Examine the conclusion to make sure it is effective at summarizing the essay. Be sure that the conclusion reiterates the thesis statement, and provides a strong sense of closure." +
        "5. Now evaluate the essay as a whole. Make sure the transistions between paragraphs are seamless, and make sure that the order of the arguments are logical. If they are not, suggest some ideas that may rearrange the essay." +
        "Make sure the feedback is thorough. Do not make the feedback too short. In general, the longer and more comprehensive the feedback, the better."

        const newMessage = {
            message,
            sentTime:"begin",
            sender:"user",
            direction:"outgoing"
        }

        setMessages([...messages, newMessage])

        await sendToOpenAI([...messages, newMessage])


        // setMessages("user", "You are given this essay" + input + ".Imagine you are a teacher." +
        // "How would you give advice on the contents and grammar of the essay?")
        // const completion = await openai.chat.completions.create({
        //     messages:message,
        //     model:"gpt-3.5-turbo"
        // })

        // addMessage("assistant", completion.choices[0].message.content)
        // setAIResponse(completion.choices[0].message.content)
        // console.log(completion.choices[0].message.content)

        setAnalyzed(false);
    }

    function extractText(event) {
        const file = event.target.files[0]
        pdfToText(file)
            .then(text => setInput(text))
            .catch(error => console.error("Failed to extract text from pdf"))
    }

    return (
        <>
        <Container>
            <Card style={{padding: '3vh', backgroundColor:'#f0f0f0'}}>
                <Row>
                    <Col>
                    <h3 style={{color: "navy"}}>Essay Assistance </h3>
                        <Form.Group className='essay_form_comp'>
                            <Form.Control 
                                as="textarea"
                                value={input}
                                onChange={handleChange}
                                rows={15}
                                placeholder="Enter your essay"
                                disabled={analyzed}
                            />
                        </Form.Group>
                        <Form.Group className="essay_form_comp">
                            <Form.Label style={{color: "navy"}}>Upload PDF</Form.Label>
                            <Form.Control type="file" accept="application/pdf" onChange={extractText} disabled={analyzed}/>
                        </Form.Group>
                        
                        <Button style={{backgroundColor: 'navy', borderColor:'navy'}} onClick={analyzeButton} disabled={analyzed}>Analyze Essay</Button>
                    </Col>

                    <Col>
                    <h3 style={{color: "navy"}}>Feedback</h3>
                        <div style={{ position: "relative", height: "500px" }}>
                        <MainContainer className='essay_form_comp'>
                            <ChatContainer>
                            <MessageList>
                                {messages.map((message) => {
                                    if (message.sentTime != "begin") {
                                        return <Message model={message}></Message>
                                    }

                                })}
                            </MessageList>
                            <MessageInput placeholder="Type message here" attachButton={false} onSend={sendMessage}/>
                            </ChatContainer>
                        </MainContainer>
                        </div>
                    </Col>      
                </Row>       
            </Card>
            
        </Container>
        </>
    );
}

export default Essay;