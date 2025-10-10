const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || 'https://2yuh2s8tyv.us-east-1.awsapprunner.com/api/v1/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handle401 = (response) => {
  if (response.status === 401) {
    const event = new CustomEvent('auth:session-expired');
    window.dispatchEvent(event);
  }
};

export const adminOrdersAPI = {
  getAllOrders: async () => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/orders/?limit=1000`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      handle401(response);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

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
      handle401(response);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

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
      return { success: false, error: error.message };
    }
  },

  updateOrder: async (orderId, updateData) => {
    try {
      const response = await fetch(`${ADMIN_API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      handle401(response);
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

