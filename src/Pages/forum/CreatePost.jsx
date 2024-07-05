import { Button, Stack, Container, Modal, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';

function CreatePost(props) {

  let navigate = useNavigate();
  let [post_title, setTitle] = useState('');
  let [post_body, setBody] = useState('')
  let [post_tags, setTags] = useState([]) // post_tags are the tags the user has added to the post
  const [modalShow, setModalShow] = useState(false);

  let [tagsList, setTagsList] = useState([]); // tagsList is a list of existing tags in the DB

  const [selectedButtonIndices, setSelectedButtonIndices] = useState([]);

  useEffect(() => {
    async function getTags() {
      try {
        const response = await fetch('http://localhost:8080/tags');
        if (!response.ok) {
          throw new Error('Internal Error.');
        }
        const data = await response.json();
        const tags = data.tags;
        setTagsList(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    }
    getTags();
  }, []);

  function AddNewTag() {
    setModalShow(false);
    console.log(tagsList)
    const randomColor = 'blue'; // For now, using a hardcoded random color
    const newTagValue = document.getElementById("NewTag").value;

    // Check if the newTagValue is not empty before pushing it to the tagsList
    if (newTagValue.trim() !== '') {
      tagsList.push({ tag: newTagValue, color: randomColor });
      handleButtonClick(tagsList.length - 1);
    }
  }

  // Function to handle button click
  const handleButtonClick = (index) => {
    console.log("here")
    // If button is already selected, deselect it
    if (selectedButtonIndices.includes(index)) {
      setSelectedButtonIndices(selectedButtonIndices.filter((i) => i !== index));
      setTags(post_tags.filter((tag) => tag !== tagsList[index].tag));
    } else {
      // Otherwise, select it
      setSelectedButtonIndices([...selectedButtonIndices, index]);
      setTags([...post_tags, tagsList[index].tag]);
    }
  };

  async function createPost() {

    let requestData = { title: post_title, text: post_body, tags: post_tags };
    try {
      await fetch('http://localhost:8080/forum', {
        credentials: 'include',
        method: "POST",
        body: JSON.stringify(requestData)
      })
        .then((response) => {
          if (response.status == 409) {
            setCreateAccountError('');
          }
          else {
            window.location.reload();
          }
        });
    }
    catch (error) {
      setCreateAccountError(error.message);
    }
  }

  function CreatePostButton() {
    if (post_title != '' && post_body != '' && post_tags.length > 0) {
      return <Button className="create_post_buttons" onClick={createPost}>Create Post</Button>;
    }
    else {
      return <Button className="create_post_buttons" disabled>Create Post</Button>
    }
  }

  return (
    <>
      <Stack gap={2}>
        <Form>
          <Form.Group className="login_form" controlId="Username">
            <Form.Control
              placeholder='Title'
              onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>

          <MDEditor
            value={post_body}
            onChange={setBody}
            preview="edit"
            textareaProps={{
              placeholder: "What's this post about?",
            }}
          />

          <Button className="create_post_buttons" onClick={() => setModalShow(true)}>Add Tags</Button>

          <TagModal show={modalShow} onHide={() => setModalShow(false)} />

          <Stack direction="horizontal" gap={3}>
            <CreatePostButton />
            <Button className="create_post_buttons" href="/">Discard Post</Button>
          </Stack>
        </Form>
      </Stack>
    </>
  )

  function TagModal(props) {

    return (
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Add Tags
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="grid-example">
          <Container>
            <div className="grid-container">
              {tagsList.map((tagObj, index) => (
                <Button
                  key={index}
                  className="grid-item"
                  style={{
                    backgroundColor: selectedButtonIndices.includes(index) ? tagObj.color : "white",
                    color: selectedButtonIndices.includes(index) ? 'white' : 'black'
                  }}
                  onClick={() => handleButtonClick(index)}
                >
                  {tagObj.tag}
                  &nbsp;
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                  </svg>
                </Button>
              ))}
            </div>
            <br />
            <Form.Group controlId="NewTag">
              <Form.Control
                placeholder="Create New Tag"
              />
            </Form.Group>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={AddNewTag}>Add Tag</Button>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreatePost;