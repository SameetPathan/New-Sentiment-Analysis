import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faTrash, 
  faCalendarAlt, 
  faFolder, 
  faLink, 
  faTags,
  faNewspaper,
  faUpload,
  faImage,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import '../MyPosts.css';

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    source: '',
    tags: ''
  });
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  // Fetch user's posts
// Inside MyPosts component
useEffect(() => {
    const fetchPosts = async () => {
      try {
        const db = getDatabase();
        const postsRef = ref(db, 'NewsSentimentAnalysis/news');
        
        const snapshot = await get(postsRef);
        if (snapshot.exists()) {
          const postsData = [];
          snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            // Filter posts by current user
            if (post.authorId === user.userId) {
              postsData.push({
                id: childSnapshot.key,
                ...post
              });
            }
          });
          setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
        }
      } catch (error) {
        setError('Failed to fetch posts');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setNewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open edit modal
  const handleEditClick = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      description: post.description,
      category: post.category,
      source: post.source || '',
      tags: post.tags ? post.tags.join(', ') : ''
    });
    setPreviewUrl(post.imageUrl || '');
    setShowEditModal(true);
  };

  // Handle post update
  const handleUpdate = async () => {
    setUpdating(true);
    setError('');

    try {
      let imageUrl = editingPost.imageUrl;

      // Handle image update if new image is selected
      if (newImage) {
        // Delete old image if exists
        if (editingPost.imageUrl) {
          const storage = getStorage();
          const oldImageRef = storageRef(storage, editingPost.imageUrl);
          try {
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }

        // Upload new image
        const storage = getStorage();
        const imageRef = storageRef(storage, `news-images/${Date.now()}-${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Update post data
      const db = getDatabase();
      const postRef = ref(db, `NewsSentimentAnalysis/news/${editingPost.id}`);
      
      await update(postRef, {
        ...editForm,
        imageUrl,
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === editingPost.id 
            ? { 
                ...post, 
                ...editForm, 
                imageUrl,
                tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
              }
            : post
        )
      );

      setShowEditModal(false);
      setNewImage(null);
      setPreviewUrl('');
    } catch (error) {
      setError('Failed to update post');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    try {
      const db = getDatabase();
      const postRef = ref(db, `NewsSentimentAnalysis/news/${deletingPost.id}`);
      
      // Delete image from storage if exists
      if (deletingPost.imageUrl) {
        const storage = getStorage();
        const imageRef = storageRef(storage, deletingPost.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Delete post from database
      await remove(postRef);

      // Update local state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== deletingPost.id));
      setShowDeleteModal(false);
    } catch (error) {
      setError('Failed to delete post');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="my-posts-page" style={{marginTop:"50px"}}>
      <Container>
       
        
        {error && <Alert variant="danger" className="animated fadeIn">{error}</Alert>}
        
        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" />
            <p>Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="empty-state-card">
            <Card.Body>
              <div className="empty-state">
                <FontAwesomeIcon icon={faNewspaper} className="empty-icon" />
                <h4>No posts yet</h4>
                <p>You haven't created any posts yet. Start sharing news with the community!</p>
                <Button variant="primary" href="/post-news">Create Your First Post</Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {posts.map(post => (
              <Col md={6} lg={4} key={post.id} className="mb-4">
                <Card className="post-card">
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img src={post.imageUrl} alt={post.title} className="post-image" />
                    </div>
                  )}
                  <Card.Body>
                    <div className="post-category">
                      <FontAwesomeIcon icon={faFolder} className="category-icon" />
                      {post.category}
                    </div>
                    <Card.Title className="post-title">{post.title}</Card.Title>
                    <div className="post-date">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <Card.Text className="post-description">{post.description}</Card.Text>
                    
                    {post.source && (
                      <div className="post-source">
                        <FontAwesomeIcon icon={faLink} className="me-2" />
                        <a href={post.source} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      </div>
                    )}
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        <FontAwesomeIcon icon={faTags} className="tags-icon" />
                        {post.tags.map((tag, index) => (
                          <Badge key={index} className="tag-badge">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="post-actions">
                      <Button 
                        variant="light"
                        className="action-button edit-button"
                        onClick={() => handleEditClick(post)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </Button>
                      <Button 
                        variant="light"
                        className="action-button delete-button"
                        onClick={() => {
                          setDeletingPost(post);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Edit Modal */}
        <Modal 
          show={showEditModal} 
          onHide={() => setShowEditModal(false)} 
          size="lg"
          className="custom-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit Post
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="form-section">
                <Form.Group className="floating-form-group mb-4">
                  <Form.Control
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    placeholder="Enter title"
                    className="custom-input"
                  />
                  <Form.Label>Title</Form.Label>
                </Form.Group>

                <Form.Group className="floating-form-group mb-4">
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={4}
                    required
                    placeholder="Enter description"
                    className="custom-input custom-textarea"
                  />
                  <Form.Label>Description</Form.Label>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="floating-form-group mb-4">
                      <Form.Select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        required
                        className="custom-input"
                      >
                        <option value="general">General</option>
                        <option value="politics">Politics</option>
                        <option value="technology">Technology</option>
                        <option value="business">Business</option>
                        <option value="science">Science</option>
                        <option value="health">Health</option>
                        <option value="sports">Sports</option>
                        <option value="entertainment">Entertainment</option>
                      </Form.Select>
                      <Form.Label>Category</Form.Label>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="floating-form-group mb-4">
                      <Form.Control
                        type="text"
                        name="source"
                        value={editForm.source}
                        onChange={handleEditChange}
                        placeholder="Enter source"
                        className="custom-input"
                      />
                      <Form.Label>Source</Form.Label>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="floating-form-group mb-4">
                  <Form.Control
                    type="text"
                    name="tags"
                    value={editForm.tags}
                    onChange={handleEditChange}
                    placeholder="Enter tags"
                    className="custom-input"
                  />
                  <Form.Label>Tags (comma separated)</Form.Label>
                </Form.Group>

                <Form.Group className="mb-4">
                  <div className="image-upload-container">
                    <div className="upload-area">
                      <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                      />
                      <p>Drop your image here or click to browse</p>
                      <small className="text-muted">
                        Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                      </small>
                    </div>
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdate}
              disabled={updating}
              className="save-button"
            >
              {updating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)}
          className="custom-modal delete-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-danger" />
              Confirm Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <FontAwesomeIcon icon={faTrash} className="delete-icon" />
              <h4>Are you sure?</h4>
              <p>This action cannot be undone. This will permanently delete your post.</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="delete-confirm-button">
              Yes, Delete Post
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default MyPosts;