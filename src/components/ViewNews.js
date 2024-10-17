// pages/ViewNews.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import '../ViewNews.css';

function ViewNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const db = getDatabase();
        const newsRef = ref(db, 'NewsSentimentAnalysis/news');
        const snapshot = await get(newsRef);
        if (snapshot.exists()) {
          const newsData = [];
          snapshot.forEach((childSnapshot) => {
            newsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
          setNewsList(newsData);
        } else {
          setError('No news found');
        }
      } catch (error) {
        setError('Error fetching news');
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  const getSentimentBadge = (sentiment) => {
    let variant, text;
    switch (sentiment) {
      case 'negative':
        variant = 'danger';
        text = 'Negative';
        break;
      case 'positive':
        variant = 'success';
        text = 'Positive';
        break;
      default:
        variant = 'warning';
        text = 'Neutral';
    }
    return <Badge bg={variant}>{text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <h2>{error}</h2>
        <Button variant="primary" onClick={() => navigate('/post-news')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Post News
        </Button>
      </Container>
    );
  }

  return (
    <Container className="view-news-page py-5">
      <h1 className="text-center mb-5">All News Articles</h1>
      <Row>
        {newsList.map((news) => (
          <Col md={6} lg={4} key={news.id} className="mb-4">
            <Card className="shadow-lg h-100">
              {news.imageUrl && (
                <Card.Img variant="top" src={news.imageUrl} alt={news.title} className="news-image" />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{news.title}</Card.Title>
                <Card.Text className="text-truncate mb-3">{news.description}</Card.Text>
                <div className="mt-auto">
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <p className="mb-0">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      {news.author}
                    </p>
                    <p className="mb-0 text-muted">
                      <FontAwesomeIcon icon={faCalendar} className="me-2" />
                      {new Date(news.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center">
                    {getSentimentBadge(news.sentiment)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="text-center mt-4">
        <Button variant="primary" onClick={() => navigate('/post-news')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Post News
        </Button>
      </div>
    </Container>
  );
}

export default ViewNews;
