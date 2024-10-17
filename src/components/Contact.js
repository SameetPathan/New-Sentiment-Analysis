// pages/Contact.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser, faEnvelope, faComment, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '../Contact.css'; // Make sure to update the CSS file

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log({ name, email, message });
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Container fluid className="contact-page py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <h1 className="text-center mb-4">Contact Us</h1>
              {submitted && (
                <Alert variant="success" onClose={() => setSubmitted(false)} dismissible>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  Thank you for your message. We'll get back to you soon!
                </Alert>
              )}
              <Row>
                <Col md={6} className="mb-4 mb-md-0">
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formName" className="mb-3">
                      <Form.Label className="text-muted">
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Name
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter your name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label className="text-muted">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Email address
                      </Form.Label>
                      <Form.Control 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formMessage" className="mb-4">
                      <Form.Label className="text-muted">
                        <FontAwesomeIcon icon={faComment} className="me-2" />
                        Message
                      </Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={5} 
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="primary" type="submit" size="lg">
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        Send Message
                      </Button>
                    </div>
                  </Form>
                </Col>
                <Col md={6}>
                  <div className="contact-info">
                    <h4 className="mb-4">Get in Touch</h4>
                    <p className="text-muted mb-4">
                      We'd love to hear from you. Please fill out the form or contact us using the information below.
                    </p>
                    <ul className="list-unstyled">
                      <li className="mb-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-primary" />
                        Pune - 412101
                      </li>
                      <li className="mb-3">
                        <FontAwesomeIcon icon={faPhone} className="me-2 text-primary" />
                        +91 7863673638
                      </li>
                      <li className="mb-3">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                        info@example.com
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Contact;
