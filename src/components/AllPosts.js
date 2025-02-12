// components/AllPosts.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import { getDatabase, ref, get } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons';

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const db = getDatabase();
        const postsRef = ref(db, 'NewsSentimentAnalysis/news');
        const snapshot = await get(postsRef);
        
        if (snapshot.exists()) {
          const postsData = [];
          snapshot.forEach((childSnapshot) => {
            postsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          // Sort posts by creation date (newest first)
          setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">All Posts</h2>
      
      {posts.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <h4>No posts available</h4>
            <p>There are currently no posts to display.</p>
          </Card.Body>
        </Card>
      ) : (
        posts.map(post => (
          <Card key={post.id} className="mb-4 shadow-sm">
            <Card.Body>
              <div>
                <Card.Title>{post.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                  {new Date(post.createdAt).toLocaleDateString()}
                  <span className="ms-3">
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {post.authorEmail}
                  </span>
                </Card.Subtitle>
              </div>
              
              <Card.Text className="mt-3">{post.description}</Card.Text>
              
              {post.imageUrl && (
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="mt-2 mb-3"
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              )}
              
              <div className="mt-2">
                <strong>Category:</strong> {post.category}
              </div>
              {post.source && (
                <div>
                  <strong>Source:</strong> {post.source}
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="badge bg-secondary me-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default AllPosts;