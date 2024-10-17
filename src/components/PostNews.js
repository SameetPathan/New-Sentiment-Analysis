// pages/PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faTimes } from '@fortawesome/free-solid-svg-icons';
import firebase from '../firebase';
import '../PostNews.css'; // Make sure to create this CSS file

function PostNews() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newsRef = firebase.database().ref('news');
    const newNews = {
      title,
      description,
      imageUrl,
      author,
      contactDetails,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    newsRef.push(newNews)
      .then(() => {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setAuthor('');
        setContactDetails('');
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const closeAlert = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Container className="post-news-page">
      <Card className="shadow-sm">
        <Card.Body>
          <h1 className="text-center mb-4">Post News</h1>
          {error && (
            <Alert variant="danger" dismissible onClose={closeAlert}>
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={closeAlert}>
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
              News posted successfully!
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter news title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                placeholder="Enter news description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group controlId="formImageUrl">
              <Form.Label>Image URL</Form.Label>
              <Form.Control 
                type="url" 
                placeholder="Enter image URL" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group controlId="formAuthor">
              <Form.Label>Author</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter author name" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group controlId="formContactDetails">
              <Form.Label>Contact Details</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter contact details" 
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                className="form-control-lg"
              />
            </Form.Group>

            <Button variant="primary" type="submit" size="lg" block className="mt-4">
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
              Post News
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PostNews;
