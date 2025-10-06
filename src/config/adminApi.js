const ADMIN_API_BASE_URL = 'https://2yuh2s8tyv.us-east-1.awsapprunner.com/api/v1/admin';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Admin Orders API
export const adminOrdersAPI = {
  // Get all orders
  getAllOrders: async () => {
    try {
      // Fetch with a large limit to get all orders at once
      const response = await fetch(`${ADMIN_API_BASE_URL}/orders/?limit=1000`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }
  },

  // Get signed URL for uploading admin preview image
  getUploadUrl: async (orderId, fileName, fileType) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/orders/${orderId}/upload-url`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fileName,
          fileType
        })
      });
      const data = await response.json();
      console.log('🔗 Upload URL API response:', data);
      return data;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      return { success: false, error: error.message };
    }
  },

  // Upload image to S3 using signed URL
  uploadImage: async (signedUrl, file) => {
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      return { success: response.ok };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  },

  // Update order status and details
  updateOrder: async (orderId, updateData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }
  }
};

