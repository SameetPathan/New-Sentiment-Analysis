// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Register from './components/Register';
import Login from './components/Login';
import PostNews from './components/PostNews';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post-news" element={<PostNews />} />
        </Routes>
        <footer className="bg-dark text-light py-4">
        <Container>
        
          <Row className="mt-3">
            <Col className="text-center">
              <p>&copy; 2023 Sentiment Analysis. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </Router>
  );
}

export default App;
