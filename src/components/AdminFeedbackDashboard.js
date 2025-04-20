// AdminFeedbackDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faStar, 
  faFilter, 
  faSort, 
  faReply, 
  faTrash,
  faCheckCircle,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { useAuth } from './AuthContext';
import { getFeedbackStats, updateFeedbackStatus, deleteFeedback } from './feedbackService';
import Chart from 'chart.js/auto';
import './AdminFeedbackDashboard.css';

function AdminFeedbackDashboard() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [responseError, setResponseError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.userType !== 'admin') {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }
    
    // Load feedback data
    loadFeedbackData();
    
    // Load statistics
    loadFeedbackStats();
  }, [user]);

  const loadFeedbackData = () => {
    const db = getDatabase();
    const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
    
    onValue(feedbackRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        const feedbackData = snapshot.val();
        const feedbackList = Object.keys(feedbackData).map(key => ({
          id: key,
          ...feedbackData[key]
        }));
        
        setFeedback(feedbackList);
      } else {
        setFeedback([]);
      }
      setLoading(false);
    });
  };

  const loadFeedbackStats = async () => {
    try {
      const statsData = await getFeedbackStats();
      setStats(statsData);
      
      // Create charts after stats are loaded
      if (statsData) {
        setTimeout(() => {
          createCharts(statsData);
        }, 500);
      }
    } catch (err) {
      console.error('Error loading feedback stats:', err);
    }
  };

  const createCharts = (statsData) => {
    // Create Rating Distribution Chart
    const ratingCtx = document.getElementById('ratingChart');
    if (ratingCtx) {
      // Check if chart exists before destroying
      if (window.ratingChart instanceof Chart) {
        window.ratingChart.destroy();
      }
      
      window.ratingChart = new Chart(ratingCtx, {
        type: 'bar',
        data: {
          labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
          datasets: [{
            label: 'Number of Ratings',
            data: [
              statsData.byRating[1] || 0,
              statsData.byRating[2] || 0,
              statsData.byRating[3] || 0,
              statsData.byRating[4] || 0,
              statsData.byRating[5] || 0
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Rating Distribution'
            }
          }
        }
      });
    }
    
    // Create Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
      // Check if chart exists before destroying
      if (window.categoryChart instanceof Chart) {
        window.categoryChart.destroy();
      }
      
      const categories = Object.keys(statsData.byCategory || {});
      const categoryData = categories.map(cat => statsData.byCategory[cat] || 0);
      
      window.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: categories.map(c => getCategoryLabel(c)),
          datasets: [{
            data: categoryData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Feedback by Category'
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  };
  
  // Handle responding to feedback
  const handleOpenResponseModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setAdminResponse(feedbackItem.adminResponse || '');
    setShowResponseModal(true);
  };
  
  const handleSubmitResponse = async () => {
    if (!adminResponse.trim()) {
      setResponseError('Please enter a response');
      return;
    }
    
    try {
      const result = await updateFeedbackStatus(
        selectedFeedback.id, 
        'responded', 
        adminResponse
      );
      
      if (result.success) {
        setShowResponseModal(false);
        setAdminResponse('');
        setResponseError('');
      } else {
        setResponseError('Failed to submit response: ' + result.error);
      }
    } catch (err) {
      setResponseError('An error occurred while submitting your response');
      console.error(err);
    }
  };
  
  // Handle marking feedback as reviewed
  const handleMarkAsReviewed = async (feedbackId) => {
    try {
      await updateFeedbackStatus(feedbackId, 'reviewed');
    } catch (err) {
      console.error('Error marking feedback as reviewed:', err);
    }
  };
  
  // Handle deleting feedback
  const handleOpenDeleteModal = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowDeleteModal(true);
  };
  
  const handleDeleteFeedback = async () => {
    try {
      const result = await deleteFeedback(selectedFeedback.id);
      
      if (result.success) {
        setShowDeleteModal(false);
      } else {
        setError('Failed to delete feedback: ' + result.error);
      }
    } catch (err) {
      setError('An error occurred while deleting the feedback');
      console.error(err);
    }
  };
  
  // Filter and sort feedback
  const getFilteredAndSortedFeedback = () => {
    let filteredList = [...feedback];
    
    // Apply category filter
    if (filter !== 'all') {
      filteredList = filteredList.filter(item => item.category === filter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filteredList.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filteredList.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'highest-rating':
        filteredList.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-rating':
        filteredList.sort((a, b) => a.rating - b.rating);
        break;
      case 'pending':
        filteredList.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return b.timestamp - a.timestamp;
        });
        break;
      default:
        filteredList.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return filteredList;
  };
  
  // Helper function to get display name for category
  const getCategoryLabel = (category) => {
    const labels = {
      'general': 'General Feedback',
      'bug': 'Bug Report',
      'feature': 'Feature Request',
      'content': 'Content Quality',
      'sentiment': 'Sentiment Analysis'
    };
    return labels[category] || category;
  };
  
  // Helper function to get badge color for status
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'pending': 'warning',
      'reviewed': 'info',
      'responded': 'success'
    };
    return variants[status] || 'secondary';
  };
  
  // Helper function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={i <= rating ? 'text-warning' : 'text-muted'} 
        />
      );
    }
    return stars;
  };
  
  // If not an admin, show error
  if (error) {
    return (
      <Container className="mt-5 pt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  // If loading, show loading message
  if (loading && !stats) {
    return (
      <Container className="mt-5 pt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading feedback dashboard...</p>
      </Container>
    );
  }
  
  return (
    <Container className="admin-feedback-dashboard py-5" style={{marginTop:"50px"}}>
      <h2 className="mb-4">
        <FontAwesomeIcon icon={faComments} className="me-2" />
        Feedback Management
      </h2>
      
      {/* Stats Cards */}
      {stats && (
        <Row className="stats-cards mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 stat-card">
              <Card.Body className="text-center">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Feedback</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 stat-card">
              <Card.Body className="text-center">
                <div className="stat-value">{stats.averageRating}</div>
                <div className="stat-label">Average Rating</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 stat-card">
              <Card.Body className="text-center">
                <div className="stat-value">{stats.byStatus.pending || 0}</div>
                <div className="stat-label">Pending Feedback</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="h-100 stat-card">
              <Card.Body className="text-center">
                <div className="stat-value">{stats.byStatus.responded || 0}</div>
                <div className="stat-label">Responded</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* Charts */}
      <Row className="chart-row mb-4">
        <Col md={6} className="mb-4">
          <Card className="h-100 chart-card">
            <Card.Body>
              <canvas id="ratingChart"></canvas>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100 chart-card">
            <Card.Body>
              <canvas id="categoryChart"></canvas>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Filter and Sort Controls */}
      <Card className="mb-4 filter-card">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Filter by Category
                </Form.Label>
                <Form.Select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="general">General Feedback</option>
                  <option value="bug">Bug Reports</option>
                  <option value="feature">Feature Requests</option>
                  <option value="content">Content Quality</option>
                  <option value="sentiment">Sentiment Analysis</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FontAwesomeIcon icon={faSort} className="me-2" />
                  Sort By
                </Form.Label>
                <Form.Select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest-rating">Highest Rating</option>
                  <option value="lowest-rating">Lowest Rating</option>
                  <option value="pending">Pending First</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Feedback List */}
      <div className="feedback-list">
        <h3 className="mb-3">Feedback Items</h3>
        
        {getFilteredAndSortedFeedback().length === 0 ? (
          <Alert variant="info">No feedback found matching the selected criteria.</Alert>
        ) : (
          getFilteredAndSortedFeedback().map(item => (
            <Card key={item.id} className="mb-3 feedback-item">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <Badge bg={getStatusBadgeVariant(item.status)} className="me-2">
                    {item.status === 'pending' ? 'Pending' : 
                     item.status === 'reviewed' ? 'Reviewed' : 'Responded'}
                  </Badge>
                  <Badge bg="info">{getCategoryLabel(item.category)}</Badge>
                </div>
                <div className="rating-display">
                  {renderStarRating(item.rating)}
                </div>
              </Card.Header>
              <Card.Body>
                <Card.Title>Feedback from {item.userName || 'User'}</Card.Title>
                <Card.Text>{item.feedback}</Card.Text>
                
                {item.adminResponse && (
                  <div className="admin-response mt-3">
                    <h6 className="response-header">Your Response:</h6>
                    <p className="response-text">{item.adminResponse}</p>
                  </div>
                )}
              </Card.Body>
              <Card.Footer className="text-muted d-flex justify-content-between align-items-center">
                <small>
                  {new Date(item.timestamp).toLocaleString()}
                  {item.phoneNumber && ` • ${item.phoneNumber}`}
                </small>
                <div className="action-buttons">
                  {item.status === 'pending' && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleMarkAsReviewed(item.id)}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      Mark as Reviewed
                    </Button>
                  )}
                  <Button 
                    variant="outline-info" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleOpenResponseModal(item)}
                  >
                    <FontAwesomeIcon icon={faReply} className="me-1" />
                    Respond
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleOpenDeleteModal(item)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                    Delete
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          ))
        )}
      </div>
      
      {/* Response Modal */}
      <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Respond to Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <>
              <div className="original-feedback mb-3">
                <h6>Original Feedback:</h6>
                <p>{selectedFeedback.feedback}</p>
                <div className="d-flex mb-2">
                  <small className="text-muted me-2">Rating:</small>
                  <div>{renderStarRating(selectedFeedback.rating)}</div>
                </div>
                <small className="text-muted">
                  From: {selectedFeedback.userName || 'User'} • {new Date(selectedFeedback.timestamp).toLocaleString()}
                </small>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Your Response:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter your response to the feedback..."
                />
              </Form.Group>
              
              {responseError && <Alert variant="danger">{responseError}</Alert>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitResponse}>
            Send Response
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
          {selectedFeedback && (
            <div className="delete-preview p-2 bg-light rounded">
              <p><strong>Feedback:</strong> {selectedFeedback.feedback}</p>
              <p><strong>From:</strong> {selectedFeedback.userName || 'User'}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteFeedback}>
            Delete Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminFeedbackDashboard;