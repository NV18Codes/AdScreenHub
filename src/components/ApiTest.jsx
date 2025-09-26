import React, { useState } from 'react';
import { dataAPI, ordersAPI, filesAPI, API_BASE_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const ApiTest = () => {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing all API endpoints...');
      
      const tests = {};
      
      // Test 1: Get all plans
      try {
        const plansResponse = await dataAPI.getPlans();
        tests.plans = { success: plansResponse.success, data: plansResponse.data };
      } catch (error) {
        tests.plans = { error: error.message };
      }
      
      // Test 2: Get locations for a specific date
      try {
        const today = new Date().toISOString().split('T')[0];
        const locationsResponse = await dataAPI.getLocationAvailability(today);
        tests.locations = { success: locationsResponse.success, data: locationsResponse.data };
      } catch (error) {
        tests.locations = { error: error.message };
      }
      
      // Test 3: Get plans by location (this might fail with 404)
      try {
        const plansByLocationResponse = await dataAPI.getPlansByLocation(1);
        tests.plansByLocation = { 
          success: plansByLocationResponse.success, 
          data: plansByLocationResponse.data,
          error: plansByLocationResponse.error 
        };
      } catch (error) {
        tests.plansByLocation = { error: error.message };
      }
      
      // Test 4: Check availability (this might fail with 404)
      try {
        const today = new Date().toISOString().split('T')[0];
        const availabilityResponse = await dataAPI.checkAvailability(1, 1, today);
        tests.availability = { 
          success: availabilityResponse.success, 
          data: availabilityResponse.data,
          error: availabilityResponse.error 
        };
      } catch (error) {
        tests.availability = { error: error.message };
      }
      
      // Test 5: File upload signed URL
      try {
        const signedUrlResponse = await filesAPI.getSignedUploadUrl('test.jpg', 'image/jpeg');
        tests.signedUrl = { 
          success: signedUrlResponse.success, 
          data: signedUrlResponse.data,
          error: signedUrlResponse.error 
        };
      } catch (error) {
        tests.signedUrl = { error: error.message };
      }
      
      // Test 6: Order initiation
      try {
        const orderPayload = {
          planId: "1",
          locationId: "1", 
          startDate: new Date().toISOString().split('T')[0],
          price: 7500, // Added required price field
          creativeFilePath: "test/path.jpg",
          creativeFileName: "test.jpg",
          deliveryAddress: {
            street: "Test Street",
            city: "Test City", 
            state: "Test State",
            zip: "12345"
          },
          gstInfo: "TEST123456789"
        };
        const orderResponse = await ordersAPI.initiateOrder(orderPayload);
        tests.orderInitiate = { 
          success: orderResponse.success, 
          data: orderResponse.data,
          error: orderResponse.error 
        };
      } catch (error) {
        tests.orderInitiate = { error: error.message };
      }
      
      // Test 7: Try alternative endpoint patterns
      try {
        // Try different endpoint patterns that might exist
        const altEndpoints = [
          '/data/plans',
          '/data/locations', 
          '/files/signed-upload-url',
          '/orders/initiate',
          '/orders',
          '/data/plans',
          '/data/locations',
          '/data/availability',
          '/files/signed-upload-url',
          '/orders'
        ];
        
        const altTests = {};
        for (const endpoint of altEndpoints) {
          try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            altTests[endpoint] = { 
              status: response.status, 
              statusText: response.statusText,
              exists: response.status !== 404,
              needsAuth: response.status === 401
            };
          } catch (err) {
            altTests[endpoint] = { error: err.message };
          }
        }
        tests.alternativeEndpoints = altTests;
      } catch (error) {
        tests.alternativeEndpoints = { error: error.message };
      }
      
      // Test 5: Test authenticated endpoint if user is logged in
      if (user) {
        try {
          const ordersResponse = await ordersAPI.getOrders();
          tests.orders = { success: ordersResponse.success, data: ordersResponse.data };
        } catch (error) {
          tests.orders = { error: error.message };
        }
      }
      
      setResult({ 
        tests: tests,
        user: user ? 'Logged in' : 'Not logged in'
      });
    } catch (error) {
      setResult({ success: false, error: error.message, stack: error.stack });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🧪 API Test</h4>
      <button 
        onClick={testApi} 
        disabled={loading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        {loading ? 'Testing...' : 'Test All API Endpoints'}
      </button>
      <div style={{ fontSize: '10px', marginBottom: '10px', color: '#666' }}>
        Click to test which endpoints exist and work
      </div>
      {result && (
        <div>
          <p><strong>Result:</strong></p>
          <pre style={{ fontSize: '10px', margin: '5px 0', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
