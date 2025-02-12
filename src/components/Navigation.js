// components/Navigation.js
import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
      <Container>
        {/* Brand on the left */}
        <Navbar.Brand as={Link} to="/" className="me-auto">
          <FontAwesomeIcon icon={faNewspaper} className="me-2" />
          Sentiment Analysis
        </Navbar.Brand>

        {/* Toggle button for mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navigation items on the right */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {!user && (
              <>
                <Nav.Link as={Link} to="/" className="mx-2">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className="mx-2">
                  About
                </Nav.Link>
              </>
            )}
            
            <Nav.Link as={Link} to="/view-news" className="mx-2">
              News List
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link as={Link} to="/post-news" className="mx-2">
                  Post News
                </Nav.Link>
                <Nav.Link as={Link} to={`/my-posts/${user.userId}`} className="mx-2">
                  My Posts
                </Nav.Link>
                {user.userType === 'admin' && (
                  <Nav.Link as={Link} to="/all-posts" className="mx-2">
                    All Posts
                  </Nav.Link>
                )}
                <Button variant="outline-light" onClick={handleLogout} className="ms-2">
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/register" className="mx-2">
                  Register
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="mx-2">
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;