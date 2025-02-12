// components/PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../postnew.css'

function PostNews() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    source: '',
    tags: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      if (!user) {
        throw new Error('You must be logged in to post news');
      }

      let imageUrl = '';
      if (image) {
        // Upload image to Firebase Storage
        const storage = getStorage();
        const imageRef = storageRef(storage, `news-images/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Prepare news data
      const newsData = {
        ...formData,
        imageUrl,
        authorId: user.userId,
        authorEmail: user.email,
        authorType: user.userType,
        createdAt: serverTimestamp(),
        status: 'active',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag), // Split tags and remove empty ones
      };

      // Save to Firebase Realtime Database
      const db = getDatabase();
      const newsRef = ref(db, 'NewsSentimentAnalysis/news');
      await push(newsRef, newsData);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        source: '',
        tags: ''
      });
      setImage(null);
      setPreviewUrl('');

      // Redirect after successful post
      setTimeout(() => {
        navigate('/view-news');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow">
        <Card.Header as="h4" className="bg-primary text-white">
          Post News Article
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">News posted successfully!</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter news title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter news description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
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
                value={formData.source}
                onChange={handleChange}
                placeholder="Enter news source (optional)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas"
              />
              <Form.Text className="text-muted">
                Separate tags with commas (e.g., politics, economy, global)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-2"
              />
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
              <Form.Text className="text-muted">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="py-2"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Posting...
                  </>
                ) : (
                  'Post News'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PostNews;