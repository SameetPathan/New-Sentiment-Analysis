// pages/Register.js
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faPhone, faEnvelope, faLock, faNewspaper, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { register } from '../firebase';
import '../Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    secretKey: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.userType === 'admin' && !formData.secretKey) {
      setError('Secret key is required for admin registration');
      return;
    }

    const result = register(formData);
    if (result) {
      setSuccess(true);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'user',
        secretKey: '',
      });
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
      <Row className="justify-content-center mt-5">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h2><FontAwesomeIcon icon={faNewspaper} className="me-2" />News Sentiment Analysis</h2>
              <p className="mb-0">Create your account</p>
            </Card.Header>
            <Card.Body className="p-5">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Registration successful! Please log in.</Alert>}
              <Form onSubmit={handleSubmit} className="register-form">
                <Form.Group controlId="formName" className="mb-3">
                  <Form.Label><FontAwesomeIcon icon={faUser} className="me-2" />Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter your name" name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>

                <Form.Group controlId="formPhoneNumber" className="mb-3">
                  <Form.Label><FontAwesomeIcon icon={faPhone} className="me-2" />Phone Number</Form.Label>
                  <Form.Control type="tel" placeholder="Enter your phone number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </Form.Group>

                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label><FontAwesomeIcon icon={faEnvelope} className="me-2" />Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleChange} required />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="formPassword" className="mb-3">
                      <Form.Label><FontAwesomeIcon icon={faLock} className="me-2" />Password</Form.Label>
                      <Form.Control type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formConfirmPassword" className="mb-3">
                      <Form.Label><FontAwesomeIcon icon={faLock} className="me-2" />Confirm Password</Form.Label>
                      <Form.Control type="password" placeholder="Confirm password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="formUserType" className="mb-3">
                  <Form.Label><FontAwesomeIcon icon={faUserShield} className="me-2" />User Type</Form.Label>
                  <Form.Control as="select" name="userType" value={formData.userType} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Control>
                </Form.Group>

                {formData.userType === 'admin' && (
                  <Form.Group controlId="formSecretKey" className="mb-3">
                    <Form.Label><FontAwesomeIcon icon={faLock} className="me-2" />Admin Secret Key</Form.Label>
                    <Form.Control type="password" placeholder="Enter admin secret key" name="secretKey" value={formData.secretKey} onChange={handleChange} />
                  </Form.Group>
                )}

                <Button variant="primary" type="submit" className="w-100 mt-4">
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Register
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center py-3">
              <p className="mb-0">Already have an account? <a href="/login" className="text-primary">Log In</a></p>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

  );
}

export default Register;
