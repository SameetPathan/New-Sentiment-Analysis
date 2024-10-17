// pages/NewsList.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faFlag } from '@fortawesome/free-solid-svg-icons';
import firebase from '../firebase';

function NewsList() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const newsRef = firebase.database().ref('news');
    newsRef.on('value', (snapshot) => {
      const newsData = snapshot.val();
      const newsArray = [];
      for (let id in newsData) {
        newsArray.push({ id, ...newsData[id] });
      }
      setNews(newsArray);
    });
  
    return () => newsRef.off();
  }, []);
  

  const handleDelete = (id) => {
    firebase.database().ref('news').child(id).remove();
  };

  const handleReport = (id) => {
    // Implement report functionality
    console.log('Reported news with id:', id);
  };

  return (
    <Container className="news-list-page">
      <h1 className="text-center mb-5">News List</h1>
      <Row>
        {news.map((item) => (
          <Col md={4} key={item.id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={item.imageUrl} />
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text>{item.description.substring(0, 100)}...</Card.Text>
                <Card.Text>
                  <small className="text-muted">By {item.author} on {new Date(item.timestamp).toLocaleDateString()}</small>
                </Card.Text>
                <Button variant="primary" className="mr-2">
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </Button>
                <Button variant="danger" className="mr-2" onClick={() => handleDelete(item.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </Button>
                <Button variant="warning" onClick={() => handleReport(item.id)}>
                  <FontAwesomeIcon icon={faFlag} /> Report
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default NewsList;
