// components/Navigation.js
import React, { useState } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faEnvelope, faUserPlus, faSignInAlt, faNewspaper, faList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This should be managed by your authentication system
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="font-weight-bold">
          <FontAwesomeIcon icon={faNewspaper} className="mr-2" />
          Sentiment Analysis
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/" className="mx-2">
              <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="mx-2">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="mx-2">
              <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> Contact
            </Nav.Link>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/post-news" className="mx-2">
                  <FontAwesomeIcon icon={faNewspaper} className="mr-1" /> Post News
                </Nav.Link>
                <Nav.Link as={Link} to="/news-list" className="mx-2">
                  <FontAwesomeIcon icon={faList} className="mr-1" /> News List
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout} className="ml-2">
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/register" className="mx-2">
                  <FontAwesomeIcon icon={faUserPlus} className="mr-1" /> Register
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="mx-2">
                  <FontAwesomeIcon icon={faSignInAlt} className="mr-1" /> Login
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
