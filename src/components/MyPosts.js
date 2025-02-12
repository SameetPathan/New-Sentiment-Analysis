// components/MyPosts.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getDatabase, ref, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from './AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

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
    <Container className="py-4">
      <h2 className="mb-4">My Posts</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {posts.length === 0 ? (
        <Card className="text-center p-4">
          <Card.Body>
            <h4>No posts yet</h4>
            <p>You haven't created any posts yet.</p>
          </Card.Body>
        </Card>
      ) : (
        posts.map(post => (
          <Card key={post.id} className="mb-4 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Card.Subtitle>
                </div>
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleEditClick(post)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => {
                      setDeletingPost(post);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </Button>
                </div>
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows={4}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                required
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Source</Form.Label>
              <Form.Control
                type="text"
                name="source"
                value={editForm.source}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={editForm.tags}
                onChange={handleEditChange}
                placeholder="Separate tags with commas"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain'
                  }}
                />
              )}
            </Form.Group>
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
          >
            {updating ? 'Updating...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MyPosts;