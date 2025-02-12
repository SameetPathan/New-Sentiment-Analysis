// Home.js
import React from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <Carousel fade className="custom-carousel">
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="bg1.png"
            alt="First slide"
          />
          <Carousel.Caption className="carousel-content">
            <h1 className="display-3 fw-bold">Stay Updated</h1>
            <p className="lead mb-4">Get the latest news with sentiment analysis</p>
           
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-img"
            src="bg2.jpg"
            alt="Second slide"
          />
          <Carousel.Caption className="carousel-content">
            <h1 className="display-3 fw-bold">Track Sentiment</h1>
            <p className="lead mb-4">Analyze trends and patterns in real-time</p>
            
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5 display-4">Our Features</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-graph-up text-primary"></i>
                  </div>
                  <Card.Title className="h4 mb-3">Sentiment Analysis</Card.Title>
                  <Card.Text>
                    Leverage advanced AI to understand the emotional context of news articles
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-newspaper text-success"></i>
                  </div>
                  <Card.Title className="h4 mb-3">News Aggregation</Card.Title>
                  <Card.Text>
                    Access curated news from multiple trusted sources in one place
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 feature-card">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-people text-info"></i>
                  </div>
                  <Card.Title className="h4 mb-3">Community Insights</Card.Title>
                  <Card.Text>
                    Connect with others and share valuable perspectives
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section text-center py-5 bg-primary text-white">
        <Container>
          <h2 className="display-4 mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">Join thousands of users analyzing news sentiment</p>
         
        </Container>
      </section>
    </div>
  );
}

export default Home;