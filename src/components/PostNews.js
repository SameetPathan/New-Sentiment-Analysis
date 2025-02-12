// PostNews.js
import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Row, Col } from 'react-bootstrap';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faNewspaper, 
  faUpload, 
  faTags, 
  faLink, 
  faList,
  faHeading,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import '../PostNews.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

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
        const storage = getStorage();
        const imageRef = storageRef(storage, `news-images/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const newsData = {
        ...formData,
        imageUrl,
        authorId: user.userId,
        authorEmail: user.email,
        authorType: user.userType,
        createdAt: serverTimestamp(),
        status: 'active',
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

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
    <div className="post-news-page" style={{marginTop:"50px"}}>
      <Container>
        <Card className="post-news-card">
          <Card.Header className="post-header">
            <FontAwesomeIcon icon={faNewspaper} className="header-icon" />
            <h2>Post News Article</h2>
          </Card.Header>

          <Card.Body className="p-4">
            {error && <Alert variant="danger" className="animated fadeIn">{error}</Alert>}
            {success && <Alert variant="success" className="animated fadeIn">News posted successfully!</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Left Column */}
                <Col lg={6}>
                  <div className="form-section">
                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faHeading} />
                      </div>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        //placeholder="Enter news title"
                        className="custom-input"
                      />
                      <Form.Label>Title</Form.Label>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faFileAlt} />
                      </div>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={6}
                        //placeholder="Enter news description"
                        className="custom-input custom-textarea"
                      />
                      <Form.Label>Description</Form.Label>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faList} />
                      </div>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
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
                  </div>
                </Col>

                {/* Right Column */}
                <Col lg={6}>
                  <div className="form-section">
                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faLink} />
                      </div>
                      <Form.Control
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        //placeholder="Enter news source (optional)"
                        className="custom-input"
                      />
                      <Form.Label>Source</Form.Label>
                    </Form.Group>

                    <Form.Group className="floating-form-group mb-4">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faTags} />
                      </div>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        //placeholder="Enter tags separated by commas"
                        className="custom-input"
                      />
                      <Form.Label>Tags</Form.Label>
                      <Form.Text className="text-muted">
                        Separate tags with commas (e.g., politics, economy, global)
                      </Form.Text>
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
                </Col>
              </Row>

              <div className="submit-section">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faNewspaper} className="me-2" />
                      Post News
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default PostNews;