// AllPosts.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { getDatabase, ref, get } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUser, 
  faTag, 
  faFolder, 
  faLink,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import '../AllPosts.css';

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(posts.map(post => post.category))];

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="posts-page">
      {/* Header Section */}
      <div className="page-header">
        <Container>
          <h1 className="text-center mb-4"></h1>
          <p className="text-center text-muted mb-5">
            Discover the latest news articles with sentiment analysis
          </p>
          
          {/* Search and Filter */}
          <Row className="justify-content-center mb-4">
            <Col md={6} lg={4}>
              <div className="search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </Col>
            <Col md={6} lg={4}>
              <select
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Posts Section */}
      <Container className="posts-container">
        {filteredPosts.length === 0 ? (
          <Card className="text-center p-4 no-posts-card">
            <Card.Body>
              <h4>No posts available</h4>
              <p>There are currently no posts matching your criteria.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredPosts.map(post => (
              <Col key={post.id} lg={6} className="mb-4">
                <Card className="post-card h-100">
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="post-image"
                      />
                    </div>
                  )}
                  <Card.Body>
                    <div className="post-meta">
                      <Badge bg="primary" className="category-badge">
                        <FontAwesomeIcon icon={faFolder} className="me-1" />
                        {post.category}
                      </Badge>
                      <span className="post-date">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Card.Title className="post-title">{post.title}</Card.Title>
                    
                    <div className="post-author">
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                      {post.authorEmail}
                    </div>
                    
                    <Card.Text className="post-description">
                      {post.description}
                    </Card.Text>
                    
                    {post.source && (
                      <div className="post-source">
                        <FontAwesomeIcon icon={faLink} className="me-1" />
                        <a href={post.source} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      </div>
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        <FontAwesomeIcon icon={faTag} className="me-2" />
                        {post.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            bg="secondary"
                            className="tag-badge"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default AllPosts;