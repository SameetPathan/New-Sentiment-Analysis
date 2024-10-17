// pages/About.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import '../About.css'; // Make sure to create this CSS file

function About() {
  return (
    <Container className="about-page py-5">
      <h1 className="text-center mb-5 animate__animated animate__fadeIn">About News Sentiment Analysis</h1>
      <Row className="justify-content-center">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-lg text-center hover-card animate__animated animate__fadeInLeft">
            <Card.Body className="d-flex flex-column justify-content-center">
              <FontAwesomeIcon icon={faNewspaper} size="3x" className="mb-4 text-primary icon-hover" />
              <Card.Title className="mb-3">News Aggregation</Card.Title>
              <Card.Text>
                We collect news from various sources to provide a comprehensive view of current events.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-lg text-center hover-card animate__animated animate__fadeInUp">
            <Card.Body className="d-flex flex-column justify-content-center">
              <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-4 text-success icon-hover" />
              <Card.Title className="mb-3">Sentiment Analysis</Card.Title>
              <Card.Text>
                Our advanced ML algorithms analyze the sentiment of news articles to provide insights.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-lg text-center hover-card animate__animated animate__fadeInRight">
            <Card.Body className="d-flex flex-column justify-content-center">
              <FontAwesomeIcon icon={faUsers} size="3x" className="mb-4 text-info icon-hover" />
              <Card.Title className="mb-3">User Collaboration</Card.Title>
              <Card.Text>
                Users can contribute by posting, editing, and reporting news articles.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="mt-5 text-center animate__animated animate__fadeIn">
        <h2 className="mb-4">Our Mission</h2>
        <p className="lead mission-text">
          Our mission is to provide a platform where users can access and analyze news from various sources,
          contributing to a more informed and discerning readership. We leverage cutting-edge sentiment
          analysis technology to offer insights into the emotional tone of news articles.
        </p>
      </div>
    </Container>
  );
}

export default About;
