// pages/Home.js
import React from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faNewspaper, faUsers, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import '../Home.css';

function Home() {
  return (
    <div className="home">
      <Carousel className="full-screen-carousel">
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="bg1.png"
            alt="Latest News"
          />
          <Carousel.Caption className="text-overlay">
            <h1 className="display-4">Stay Updated</h1>
            <p className="lead">Get the latest news with sentiment analysis.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="bg2.jpg"
            alt="Sentiment Trends"
          />
          <Carousel.Caption className="text-overlay">
            <h1 className="display-4">Track Sentiment Trends</h1>
            <p className="lead">Visualize sentiment changes over time.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="bg3.jpg"
            alt="Community Insights"
          />
          <Carousel.Caption className="text-overlay">
            <h1 className="display-4">Community Insights</h1>
            <p className="lead">Engage with other users and share perspectives.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      <Container className="my-5">
        <Row>
          <Col md={4}>
            <Card className="mb-4 shadow-sm text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faChartLine} size="3x" className="mb-3 text-primary" />
                <Card.Title>Sentiment Analysis</Card.Title>
                <Card.Text>
                  Leverage MI to understand the emotional tone of news articles.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faNewspaper} size="3x" className="mb-3 text-success" />
                <Card.Title>News Aggregation</Card.Title>
                <Card.Text>
                  Access news from various sources in one convenient platform.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm text-center">
              <Card.Body>
                <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 text-info" />
                <Card.Title>User Collaboration</Card.Title>
                <Card.Text>
                  Contribute by posting, editing, and reporting news articles.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      
    </div>
  );
}

export default Home;
