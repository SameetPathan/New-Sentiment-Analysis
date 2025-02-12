import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Badge, Row, Col, Button, Alert } from 'react-bootstrap';
import { getDatabase, ref, get, update } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUser, 
  faTag, 
  faFolder, 
  faLink,
  faSearch,
  faBrain,
  faChartLine,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import '../AllPosts.css';

function AllPosts() {

  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [analyzingPost, setAnalyzingPost] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const { user } = useAuth();

  // Function to analyze sentiment for a single post
  const analyzeSentiment = async (postId) => {
    setAnalyzingPost(postId);
    try {
      // Here you would integrate with your sentiment analysis API
      // For demonstration, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the post with sentiment analysis results
      const db = getDatabase();
      const postRef = ref(db, `NewsSentimentAnalysis/news/${postId}`);
      await update(postRef, {
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        sentimentScore: (Math.random() * 100).toFixed(2),
        analyzedAt: new Date().toISOString()
      });

      // Refresh posts to show new analysis
      const updatedPost = posts.find(p => p.id === postId);
      if (updatedPost) {
        setPosts(posts.map(p => p.id === postId ? { ...p, analyzed: true } : p));
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setAnalysisStatus('Error analyzing sentiment. Please try again.');
    } finally {
      setAnalyzingPost(null);
    }
  };

  // Function to analyze all posts
  const analyzeAllPosts = async () => {
    setAnalyzingAll(true);
    setAnalysisStatus('Analyzing all posts...');
    try {
      // Analyze each post sequentially
      for (const post of filteredPosts) {
        if (!post.analyzed) {
          await analyzeSentiment(post.id);
        }
      }
      setAnalysisStatus('All posts have been analyzed successfully!');
    } catch (error) {
      console.error('Error in batch analysis:', error);
      setAnalysisStatus('Error during batch analysis. Some posts may not have been analyzed.');
    } finally {
      setAnalyzingAll(false);
      setTimeout(() => setAnalysisStatus(''), 3000);
    }
  };

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

          {user?.userType === 'admin' && (
            <div className="admin-controls mb-4">
              <Button 
                variant="primary"
                className="analyze-all-btn"
                onClick={analyzeAllPosts}
                disabled={analyzingAll}
              >
                <FontAwesomeIcon 
                  icon={analyzingAll ? faSync : faBrain} 
                  className={analyzingAll ? 'fa-spin me-2' : 'me-2'} 
                />
                {analyzingAll ? 'Analyzing All News...' : 'Analyze All News'}
              </Button>
              
              {analysisStatus && (
                <Alert 
                  variant="info" 
                  className="analysis-status mt-3 animated fadeIn"
                >
                  {analysisStatus}
                </Alert>
              )}
            </div>
          )}
          
          
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
                    {user?.userType === 'admin' && (
                      <div className="sentiment-section">
                        {post.sentiment ? (
                          <div className={`sentiment-result ${post.sentiment.toLowerCase()}`}>
                            <FontAwesomeIcon icon={faChartLine} className="me-2" />
                            <span>Sentiment: {post.sentiment}</span>
                            <span className="sentiment-score">
                              Score: {post.sentimentScore}%
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="outline-primary"
                            className="analyze-btn w-100"
                            onClick={() => analyzeSentiment(post.id)}
                            disabled={analyzingPost === post.id}
                          >
                            {analyzingPost === post.id ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  className="me-2"
                                />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faBrain} className="me-2" />
                                Analyze Sentiment
                              </>
                            )}
                          </Button>
                        )}
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