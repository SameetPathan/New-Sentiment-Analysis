// pages/PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import firebase from '../firebase';

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

  return (
    <Container className="post-news-page">
      <h1 className="text-center mb-5">Post News</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">News posted successfully!</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter news title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3} 
            placeholder="Enter news description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formImageUrl">
          <Form.Label>Image URL</Form.Label>
          <Form.Control 
            type="url" 
            placeholder="Enter image URL" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
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
          />
        </Form.Group>

        <Form.Group controlId="formContactDetails">
          <Form.Label>Contact Details</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter contact details" 
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
          Post News
        </Button>
      </Form>
    </Container>
  );
}

export default PostNews;
