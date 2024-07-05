import { Row, Modal, Col, Button, Badge, Nav, Card, Stack, Container, Navbar, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost"
import Cookies from 'js-cookie';

const Forums = () => {

    let navigate = useNavigate();
    let [disp, changeDisp] = useState('Posts');
    let [posts, setPosts] = useState([]);
    let [showDelete, setShowDelete] = useState(false);
    let handleCloseDelete = () => setShowDelete(false);
    let handleShowDelete = () => setShowDelete(true);
    let username = Cookies.get('Username')
    let [currTag, setTag] = useState('');
    let [searchQuery, setSearchQuery] = useState('');
    let [postToDelId, setPostToDelId] = useState('');

    useEffect(() => {
        async function DispPosts() {
            let response = await fetch('http://localhost:8080/forumpage')
            if (!response.ok) {
                throw new Error('Internal Error.');
            }
            let data = await response.json();
            posts = data.posts;
            setPosts(posts)
        }
        DispPosts();

    }, []);

    async function HandleSearch() {
        event.preventDefault();

        let requestData = { keyword: searchQuery };

        let response = await fetch("http://localhost:8080/forum/search", {
            method: 'POST',
            body: JSON.stringify(requestData)
        })
        if (!response.ok) {
            throw new Error('Internal Error.');
        }
        let data = await response.json();
        posts = data.posts;
        setPosts(posts)
    }

    function Selected(eventKey) {
        if (eventKey === "Posts") {
            changeDisp('Posts');
        }
        else {
            if (Cookies.get('mysession') === undefined) {
                navigate('/user/login');
            }
            else {
                changeDisp('Create New Post')
            }
        }
    }

    function NavigateToPost(post) {
        let id = post.post_id;
        let fullPath = "/forum/" + id;
        navigate(fullPath);
    }

    function NavigateToUser(user) {
        let fullPath = "/user/" + user;
        navigate(fullPath);
    }

    function ConfirmedDelete(currPost) {
        console.log(currPost);

        let fullpath = "http://localhost:8080/forum/" + currPost;

        fetch(fullpath, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Delete Post Failed!");
                }
                else {
                    window.location.reload();
                    handleCloseDelete();
                }
                return response.json();
            })
    }

    function ActualDel(currPost) {
        setPostToDelId(currPost.currPost.post_id);
        handleShowDelete();
    }

    function DisplayDeleteButton(currPost) {
        if (username === currPost.currPost.author) {
            return <Button className="forum_delete_button" variant="outline-danger" onClick={() => ActualDel(currPost)}>Delete</Button>
        }
    }

    function TagClicked(tag) {
        if (currTag == '') {
            setTag(tag);
        }
        else if (currTag != tag) {
            setTag(tag);
        }
        else {
            setTag('');
        }
    }

    function Tag({ text, color, onClick }) {
        return (
            <span onClick={() => onClick(text)} className="tag_class" style={{ backgroundColor: color, color: 'white', padding: '0.2em 0.4em', borderRadius: '0.2em', marginRight: '0', marginLeft: '1.8ch', cursor: 'pointer', fontSize: '0.8em' }}>
                {text}
            </span>
        );
    }

    function DisplayPosts(props) {
        let post = props.post;
        let tag = props.tag;

        if (tag === '' && post.title.length <= 100 || post.tags.some(t => t.tag === tag) && post.title.length <= 100) {
            return (
                <Card className="forum_card">
                    <Card.Title>
                        <Row className="forum_author_name">
                            <Col md='auto' className="card_col">
                                <Card.Link style={{ color: 'navy' }} href="" onClick={() => NavigateToPost(post)}>
                                    {post.title}
                                </Card.Link>
                            </Col>
                            <Col style={{ textAlign: 'right' }}>
                                <Card.Link style={{color:'#000080'}} className="mx-auto" href="" onClick={() => NavigateToUser(post.author)}>
                                    {post.author}
                                </Card.Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col md='auto'>
                                {post.tags.map((tagObj) =>
                                    <Tag key={tagObj.tag} text={tagObj.tag} color={tagObj.color} onClick={TagClicked} />
                                )}
                            </Col>
                            <Col style={{ marginBottom: 0, textAlign: 'right' }}>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ textAlign: 'left' }}>
                                <DisplayDeleteButton currPost={post} />
                            </Col>
                        </Row>
                    </Card.Title>
                </Card>
            )
        }
        else if (tag === '' && post.title.length >= 100 || post.tags.some(t => t.tag === tag) && post.title.length >= 100) {
            let sub = post.title.substring(0, 97);
            sub = sub + "...";
            return (
                <Card className="forum_card">
                    <Card.Title>
                        <Row className="forum_author_name">
                            <Col md='auto' className="card_col">
                                <Card.Link style={{ color: 'black' }} href="" onClick={() => NavigateToPost(post)}>
                                    {sub}
                                </Card.Link>
                            </Col>
                            <Col style={{ textAlign: 'right' }}>
                                <Card.Link style={{color:'#000080'}} className="mx-auto" href="" onClick={() => NavigateToUser(post.author)}>
                                    {post.author}
                                </Card.Link>
                            </Col>
                        </Row>
                        <Row>
                            <Col md='auto'>
                                {post.tags.map((tagObj) =>
                                    <Tag text={tagObj.tag} color={tagObj.color} onClick={TagClicked} />
                                )}
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{ textAlign: 'left' }}>
                                <DisplayDeleteButton currPost={post} />
                            </Col>
                        </Row>
                    </Card.Title>
                </Card>
            )
        }
    }

    return (
        <Container className="forum_container">
            <Card className="forums_card" style={{paddingLeft: '0vh', paddingRight: '0vh', paddingTop: '0vh'}}>
                <Navbar className="forum_topbar">
                    <Container fluid>
                        <Nav onSelect={Selected} variant="underline" defaultActiveKey='Posts' className='me-auto'>
                            <Nav.Link eventKey="Posts">Posts</Nav.Link>
                            <Nav.Link eventKey="Create Post">Create New Post</Nav.Link>
                        </Nav>
                        <Nav className='justify-content-end'>
                            <Form.Group controlId='searchTerm'>
                                <Form onSubmit={HandleSearch} className='d-flex'>
                                    <Form.Control
                                        type='search'
                                        placeholder='Search Forum Posts'
                                        className='me-2'
                                        aria-label='Search'
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Button type="submit" variant='outline-success'>Search</Button>
                                </Form>
                            </Form.Group>
                        </Nav>
                    </Container>
                </Navbar>

                {disp === "Create New Post" ?
                    <CreatePost /> :
                    posts == null ?
                        <h1 style={{ textAlign: 'center' }}>No posts with the keywords specified. </h1> :
                        posts.map((post) => (
                            <DisplayPosts key={post.title} post={post} tag={currTag} />
                        ))
                }
            </Card>

            <Modal show={showDelete} onHide={handleCloseDelete}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Text>
                            Are you sure you want to delete your post? This action is irreversible.
                        </Form.Text>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => ConfirmedDelete(postToDelId)}>
                        Delete Post
                    </Button>
                    <Button variant="secondary" onClick={handleCloseDelete}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Forums;