// pages/Login.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faEnvelope, faLock, faEye, faEyeSlash, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import '../Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const db = getDatabase();
      const usersRef = ref(db, 'NewsSentimentAnalysis/users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        let userFound = false;
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          if (
            userData.email === email &&
            userData.password === password &&
            userData.userType === userType
          ) {
            userFound = true;
            // Redirect to post-news page after successful login
            navigate('/post-news');
            return;
          }
        });

        if (!userFound) {
          setError('Invalid email, password, or user type');
        }
      } else {
        setError('No users found');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <div className="login-form-wrapper">
        <h2 className="text-center mb-4">Welcome to News Sentiment Analysis</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} className="login-form">
          <Form.Group controlId="formEmail" className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faEnvelope} />
              </InputGroup.Text>
              <Form.Control 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formPassword" className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faLock} />
              </InputGroup.Text>
              <Form.Control 
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formUserType" className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faUserCircle} />
              </InputGroup.Text>
              <Form.Control 
                as="select" 
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Control>
            </InputGroup>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 mb-3" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> Login
              </>
            )}
          </Button>
        </Form>
     
        <div className="text-center mt-3">
          Don't have an account? <a href="/register">Sign up</a>
        </div>
      </div>
    </Container>
  );
}

export default Login;
