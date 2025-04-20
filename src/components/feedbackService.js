// feedbackService.js
import { getDatabase, ref, push, set, get, onValue, remove, update } from 'firebase/database';

// Submit new feedback
export const submitFeedback = async (feedbackData) => {
  try {
    const db = getDatabase();
    const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
    const newFeedbackRef = push(feedbackRef);
    
    await set(newFeedbackRef, {
      ...feedbackData,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    return { success: true, feedbackId: newFeedbackRef.key };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

// Get all feedback (for admin)
export const getAllFeedback = () => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
      
      onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
          const feedbackData = snapshot.val();
          const feedbackList = Object.keys(feedbackData).map(key => ({
            id: key,
            ...feedbackData[key]
          }));
          
          // Sort by timestamp descending (most recent first)
          feedbackList.sort((a, b) => b.timestamp - a.timestamp);
          resolve(feedbackList);
        } else {
          resolve([]);
        }
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error getting feedback:', error);
      reject(error);
    }
  });
};

// Get user feedback (filtered by userId)
export const getUserFeedback = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      const db = getDatabase();
      const feedbackRef = ref(db, 'NewsSentimentAnalysis/feedback');
      
      onValue(feedbackRef, (snapshot) => {
        if (snapshot.exists()) {
          const feedbackData = snapshot.val();
          const feedbackList = Object.keys(feedbackData)
            .filter(key => feedbackData[key].userId === userId)
            .map(key => ({
              id: key,
              ...feedbackData[key]
            }));
          
          // Sort by timestamp descending
          feedbackList.sort((a, b) => b.timestamp - a.timestamp);
          resolve(feedbackList);
        } else {
          resolve([]);
        }
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error getting user feedback:', error);
      reject(error);
    }
  });
};

// Update feedback status (admin only)
export const updateFeedbackStatus = async (feedbackId, status, adminResponse = null) => {
  try {
    const db = getDatabase();
    const feedbackRef = ref(db, `NewsSentimentAnalysis/feedback/${feedbackId}`);
    
    const updates = {
      status: status,
      updatedAt: Date.now()
    };
    
    if (adminResponse) {
      updates.adminResponse = adminResponse;
    }
    
    await update(feedbackRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return { success: false, error: error.message };
  }
};

// Delete feedback (admin only)
export const deleteFeedback = async (feedbackId) => {
  try {
    const db = getDatabase();
    const feedbackRef = ref(db, `NewsSentimentAnalysis/feedback/${feedbackId}`);
    
    await remove(feedbackRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return { success: false, error: error.message };
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async () => {
  try {
    const feedbackList = await getAllFeedback();
    
    const stats = {
      total: feedbackList.length,
      byCategory: {},
      byRating: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      },
      byStatus: {
        pending: 0,
        reviewed: 0,
        responded: 0
      },
      averageRating: 0
    };
    
    let ratingSum = 0;
    
    feedbackList.forEach(item => {
      // Count by category
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // Count by rating
      stats.byRating[item.rating] = (stats.byRating[item.rating] || 0) + 1;
      ratingSum += item.rating;
      
      // Count by status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    });
    
    // Calculate average rating
    stats.averageRating = feedbackList.length > 0 ? (ratingSum / feedbackList.length).toFixed(1) : 0;
    
    return stats;
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw error;
  }
};