// FeedbackComponent.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faComments, faStar, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { getDatabase, ref, push, set, get, onValue } from 'firebase/database';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import './Feedback.css'; // You'll need to create this CSS file

function FeedbackComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allFeedback, setAllFeedback] = useState([]);
  const [error, setError] = useState('');

  // Fetch all feedback if user is admin
  useEffect(() => {
    if (user && user.userType === 'admin') {
      const db = getDatabase();
      const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
      
      const unsubscribe = onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
          const feedbackData = snapshot.val();
          const feedbackList = Object.keys(feedbackData).map(key => ({
            id: key,
            ...feedbackData[key]
          }));
          
          // Sort by timestamp descending (most recent first)
          feedbackList.sort((a, b) => b.timestamp - a.timestamp);
          setAllFeedback(feedbackList);
        } else {
          setAllFeedback([]);
        }
      });
      
      return () => unsubscribe();
    }
  }, [user]);

  // Handle feedback submission
  const handleSubmit = async (e) => {
    debugger
    e.preventDefault();
    
    if (!feedback.trim()) {
      setError('Please enter your feedback');
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const db = getDatabase();
      const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
      const newFeedbackRef = push(feedbackRef);
      
      await set(newFeedbackRef, {
        userId: user.userId,
        userName: user.email,
        phoneNumber: user.userId,
        feedback: feedback,
        rating: rating,
        category: category,
        timestamp: Date.now(),
        status: 'pending' // pending, reviewed, responded
      });
      
      setSubmitted(true);
      setFeedback('');
      setRating(5);
      setCategory('general');
      
      // Reset the submitted state after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Generate stars for rating
  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`rating-star ${i <= rating ? 'selected' : ''}`}
          onClick={() => setRating(i)}
        >
          <FontAwesomeIcon icon={faStar} />
        </span>
      );
    }
    return stars;
  };
  
  return (
    <Container className="feedback-container py-5" style={{marginTop:"50px"}}>
      {!user && (
        <Alert variant="info" className="text-center mb-4">
          Please <Button variant="link" onClick={() => navigate('/login')}>login</Button> to submit feedback
        </Alert>
      )}
      
      {/* Feedback Form */}
      <Card className="feedback-form-card mb-5">
        <Card.Header className="bg-primary text-white">
          <FontAwesomeIcon icon={faComments} className="me-2" />
          Share Your Feedback
        </Card.Header>
        <Card.Body>
          {submitted ? (
            <Alert variant="success" className="text-center">
              <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
              Thank you for your feedback! We appreciate your input.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form.Group className="mb-3">
                <Form.Label>Feedback Category</Form.Label>
                <Form.Select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!user || submitting}
                >
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="content">Content Quality</option>
                  <option value="sentiment">Sentiment Analysis Quality</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="rating-container">
                  {renderRatingStars()}
                  <span className="ms-2">({rating}/5)</span>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Please share your thoughts, suggestions, or report issues..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={!user || submitting}
                  required
                />
              </Form.Group>
              
              <Button 
                type="submit" 
                variant="primary" 
                className="w-100" 
                disabled={!user || submitting}
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
      
      {/* Admin Feedback View */}
      {user && user.userType === 'admin' && (
        <div className="admin-feedback-section">
          <h3 className="mb-4">
            <FontAwesomeIcon icon={faComments} className="me-2" />
            All User Feedback
          </h3>
          
          {allFeedback.length === 0 ? (
            <Alert variant="info">No feedback submitted yet.</Alert>
          ) : (
            <Row>
              {allFeedback.map(item => (
                <Col md={6} lg={4} className="mb-4" key={item.id}>
                  <Card className="h-100 feedback-card">
                    <Card.Header className={`bg-${getCategoryColor(item.category)}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{getCategoryLabel(item.category)}</span>
                        <span className="badge bg-light text-dark">
                          {Array(5).fill(0).map((_, i) => (
                            <FontAwesomeIcon 
                              key={i} 
                              icon={faStar} 
                              className={i < item.rating ? 'text-warning' : 'text-secondary'} 
                            />
                          ))}
                        </span>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <Card.Text className="feedback-text">{item.feedback}</Card.Text>
                    </Card.Body>
                    <Card.Footer className="text-muted">
                      <small>
                        From: {item.userName} ({item.phoneNumber})
                        <br />
                        {new Date(item.timestamp).toLocaleString()}
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}
    </Container>
  );
}

function getCategoryLabel(category) {
  const labels = {
    'general': 'General Feedback',
    'bug': 'Bug Report',
    'feature': 'Feature Request',
    'content': 'Content Quality',
    'sentiment': 'Sentiment Analysis'
  };
  return labels[category] || 'Feedback';
}

function getCategoryColor(category) {
  const colors = {
    'general': 'info',
    'bug': 'danger',
    'feature': 'primary',
    'content': 'success',
    'sentiment': 'warning'
  };
  return colors[category] || 'secondary';
}

export default FeedbackComponent;