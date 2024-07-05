import { Modal, Row, Col, Form, Button, Container, Stack, Card, CloseButton } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import MDEditor from '@uiw/react-md-editor';

const ForumPage = () => {

    let navigate = useNavigate();
    let postId = useParams();
    let [post, setPost] = useState(Object);
    let [comments, setComments] = useState([]);
    let [show, setShowComment] = useState(false);
    let [comment, setComment] = useState('');
    let handleCloseCreateComment = () => setShowComment(false);
    let handleShowCreateComment = () => setShowComment(true);
    let fullPath = "http://localhost:8080/forum/" + postId.id
    let [commentErr, setCommentErr] = useState('');
    let [loading, setLoading] = useState(false);
    let username = Cookies.get("Username");
    let [showDelete, setShowDelete] = useState(false);
    let handleCloseDelete = () => setShowDelete(false);
    let handleShowDelete = () => setShowDelete(true);
    let [showCreateResponse, setShowCreateResponse] = useState(false);
    let handleShowCreateResponse = () => setShowCreateResponse(true);
    let handleCloseCreateResponse = () => setShowCreateResponse(false);
    let [response, setResponse] = useState('');
    let [commToResTo, setCommToResTo] = useState('');
    let [commToResToId, setCommToResToId] = useState('');
    let [commToDelId, setCommToDelId] = useState('');

    useEffect(() => {
        async function DispPost() {
            if (postId.id == undefined) {
                return
            }
            setLoading(true);
            let response = await fetch (fullPath);
            if (!response.ok) {
                throw new Error('Internal Error.');
            }
            let data = await response.json();
            setPost(data)
            setComments(data.comments);
            setLoading(false);
        }
        
        DispPost();

    }, []);

    function parseDateTime(dateTimeString) {
        var date = new Date(dateTimeString);
        // Get timezone offset
        var offset = date.getTimezoneOffset()
        // Add the timezone offset to the datetime
        const withTimeZone = new Date(date.getTime() + (offset * 60000))
        const formattedDate = withTimeZone.toLocaleString()
        return formattedDate;
    }

    function ConfirmedDelete(currComment) {
        let fullCommPath = "http://localhost:8080/comment/" + currComment;

        fetch (fullCommPath, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then ((response) => {
            if (!response.ok) {
                throw new Error("Delete Comment Failed!");
            }
            else {
                window.location.reload();
                handleCloseDelete();
            }
            return response.json();
        })
    }

    function ActualRes(currComment) {
        setCommToResTo(currComment.currComment.text);
        setCommToResToId(currComment.currComment.user_id);
        handleShowCreateResponse();
    }

    function ActualDel(currComment) {
        setCommToDelId(currComment.currComment.id)
        handleShowDelete();
    }

    function DisplayRespondButton(currComment) {
        if (username === undefined) {
            navigate('/user/login');
        }
        else {
            return (
                <Button className="outline_button" variant="outline-primary" onClick={() => ActualRes(currComment)}>Respond</Button>
            )
        }
    }

    function DisplayDeleteButton(currComment) {
        if (username === currComment.currComment.author) {
            return (
                <> 
                    <Button className="forum_delete_button" variant="outline-danger" onClick={() => ActualDel(currComment)}>Delete</Button>
                </>
            );
        }
    }

    function HandlePossibleResponses(comment) {
        let splitComment = comment.comment.text.split("[/Quote]");
        let unInd = 7;
        let username = '';
        let ogMsg = '';

        if (splitComment.length < 2) {
            return <MDEditor.Markdown key={comment.comment.text} style={{color: 'black', backgroundColor: 'white'}} className="comment_post_body" source={comment.comment.text}/>
        }

        while (splitComment[0].charAt(unInd) != ']') {
            username = username + splitComment[0].charAt(unInd);
            unInd = unInd + 1;
        }

        unInd = unInd + 1;
        while (unInd < splitComment[0].length) {
            ogMsg = ogMsg + splitComment[0].charAt(unInd);
            unInd++;
        }
        
        return (
            <>
                <Card className="response_card">
                    <MDEditor.Markdown style={{color: 'black', backgroundColor: 'white'}} className="comment_post_body" source={ogMsg}/>
                    <Row>
                        <Col>
                            <footer key={username} className="blockquote-footer">
                                Posted by {username}
                            </footer>
                        </Col>
                    </Row>
                </Card>
                <MDEditor.Markdown style={{color: 'black', backgroundColor: 'white'}} className="comment_post_body" source={splitComment[1]}/>
            </>
        )
    }

    function DispComments() {
        if (comments == null) {
            return;
        }
        else {
            let sortedComments = comments.slice().sort((a, b) => {
                return new Date(a.created_at) - new Date(b.created_at);
            });
            return (
                <>
                    <hr className="forum_hr"/>
                    {
                    sortedComments.map((comm) => (
                        <Card key={comm.created_at} className="comment_card">
                            <HandlePossibleResponses comment={comm}/>
                            <Row>
                                <Col style={{textAlign: 'left'}}>
                                    <DisplayRespondButton currComment={comm}/>
                                    <DisplayDeleteButton currComment={comm}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <footer key={comm.author} className="blockquote-footer">
                                        Posted by {comm.author} at {parseDateTime(comm.created_at)}
                                    </footer>
                                </Col>
                            </Row>
                        </Card>
                    ))
                    }
                </>
            )
        }
    }

    function ParseOriginalMsg(fullText) {
        let splitComment = fullText.fullText.split("[/Quote]");

        if (splitComment.length < 2) {
            return <MDEditor.Markdown style={{color: 'black', backgroundColor: 'white'}} className="comment_post_body" source={fullText.fullText}/>
        }

        return <MDEditor.Markdown style={{color: 'black', backgroundColor: 'white'}} className="forum_post_body" source={splitComment[1]}/>
    }

    function dispPostComment() {
        if (Cookies.get('mysession') === undefined) {
            navigate('/user/login');
        }
        else {
            handleShowCreateComment();
        }
    }

    async function HandlePostComment() {        
        let requestData = {post_id: postId.id, text: comment};
        try {
            await fetch ('http://localhost:8080/comment', {
                credentials: 'include',
                method: "POST",
                body: JSON.stringify(requestData)
            })
                .then ((response) => {
                    if (response.status == 401) {
                        setCommentErr('You must be logged in to comment.');
                    }
                    else {
                        window.location.reload();
                        handleCloseCreateComment();
                    }
                });
            }
        catch (error){
            setCreateAccountError(error.message);
        }
    }

    async function HandlePostResponse() {
        let fullRes = "[Quote=" + commToResToId + "]" + commToResTo + "[/Quote]" + response
        let requestData = {post_id: postId.id, text: fullRes};
        try {
            await fetch ('http://localhost:8080/comment', {
                credentials: 'include',
                method: "POST",
                body: JSON.stringify(requestData)
            })
                .then ((response) => {
                    if (response.status == 401) {
                        setCommentErr('You must be logged in to comment.');
                    }
                    else {
                        window.location.reload();
                        handleCloseCreateComment();
                    }
                });
            }
        catch (error){
            setCreateAccountError(error.message);
        }
    }

    function Loading() {
        return <h1>Loading...</h1>;
    }

    function RenderWhenReady() {
        if (loading) {
            return (
                <Loading/>
            )
        }
        else {
            return (
                <>
                    <Card className="post_card">
                        <Card.Title style={{color:'navy', paddingTop:'1vh'}}>
                            {post.title}
                        </Card.Title>
                        <MDEditor.Markdown style={{color: 'black', backgroundColor: 'white'}} className="forum_post_body" source={post.text}/>
                        <Row>
                            <Col style={{textAlign: 'left'}}>
                                <Button variant="outline-primary" className="comment_button" onClick={dispPostComment}>Comment</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <footer className="blockquote-footer">
                                Posted by {post.author} at {parseDateTime(post.created_at)}
                                </footer>
                            </Col>
                        </Row>
                    </Card>
                    <DispComments/>
                </>
            );
        }
    }

    return (
        <>
            <Container className="forum_container">
                <Card className="forum_post_card">
                    <Button variant="danger" className="back_to_forums_button" onClick={() => navigate('/')}>Back To Forums</Button>
                    <Stack className="forum_stack" gap={3}>
                        <RenderWhenReady/>
                        
                        <Modal size='lg' show={show} onHide={handleCloseCreateComment}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Comment</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group className="recovery" onChange={(e) => setComment(e.target.value)}>
                                        <MDEditor
                                            autoFocus
                                            value={comment}
                                            onChange={setComment}
                                            preview="edit"
                                            textareaProps={{
                                              placeholder: "Comment",
                                            }}/>
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer style={{justifyContent: 'left'}}>
                                <Button variant="primary" onClick={HandlePostComment}>
                                    Post Comment
                                </Button>
                                <Button variant="secondary" onClick={handleCloseCreateComment}>
                                    Close
                                </Button>
                            </Modal.Footer>
                            {commentErr && <p style={{ color: 'red' }}>{commentErr}</p>}
                        </Modal>

                        <Modal size='lg' show={showCreateResponse} onHide={handleCloseCreateResponse}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Response</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group className="recovery" onChange={(e) => setResponse(e.target.value)}>
                                        <Card className="response_original_text_card">
                                            <ParseOriginalMsg fullText={commToResTo} />
                                        </Card>
                                        <MDEditor
                                            autoFocus
                                            value={response}
                                            onChange={setResponse}
                                            preview="edit"
                                            textareaProps={{
                                              placeholder: "Response",
                                            }}/>
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer style={{justifyContent: 'left'}}>
                                <Button variant="primary" onClick={HandlePostResponse}>
                                    Post Response
                                </Button>
                                <Button variant="secondary" onClick={handleCloseCreateResponse}>
                                    Close
                                </Button>
                            </Modal.Footer>
                            {commentErr && <p style={{ color: 'red' }}>{commentErr}</p>}
                        </Modal>

                        <Modal show={showDelete} onHide={handleCloseDelete}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete Comment</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Text>
                                    Are you sure you want to delete your comment? This action is irreversible.
                                </Form.Text>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={() => ConfirmedDelete(commToDelId)}>
                                Delete Comment
                            </Button>
                            <Button variant="secondary" onClick={handleCloseDelete}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    
                    </Stack>
                </Card>
            </Container>         
        </>
    );
}

export default ForumPage;