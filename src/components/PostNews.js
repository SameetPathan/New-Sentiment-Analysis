// pages/PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faTimes, faImage, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import '../PostNews.css';

function PostNews() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    author: '',
    contactDetails: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const db = getDatabase();
      const newsRef = ref(db, 'NewsSentimentAnalysis/news');
      const newNews = {
        ...formData,
        timestamp: serverTimestamp()
      };

      const newNewsRef = await push(newsRef, newNews);
      setLoading(false);
      navigate(`/view-news`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Container className="post-news-page py-5">
      <Card className="shadow-lg">
        <Card.Body className="p-5">
          <h1 className="text-center mb-4">Post News</h1>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="formTitle" className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter news title" 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formImageUrl" className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control 
                    type="url" 
                    placeholder="Enter image URL" 
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={5} 
                placeholder="Enter news description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="form-control-lg"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formAuthor" className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter author name" 
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formContactDetails" className="mb-3">
                  <Form.Label>Contact Details</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter contact details" 
                    name="contactDetails"
                    value={formData.contactDetails}
                    onChange={handleChange}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button 
              variant="primary" 
              type="submit" 
              size="lg" 
              className="w-100 mt-4"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faNewspaper} className="me-2" />
              {loading ? 'Posting...' : 'Post News'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PostNews;
