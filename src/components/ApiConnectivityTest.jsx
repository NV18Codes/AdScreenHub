import React, { useState, useEffect } from 'react';
import { authAPI, dataAPI, filesAPI, ordersAPI } from '../config/api';

const ApiConnectivityTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [overallStatus, setOverallStatus] = useState('pending');

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults({});
    setOverallStatus('testing');

    const results = {};

    // Test 1: Authentication APIs
    console.log('🔐 Testing Authentication APIs...');
    try {
      const authTests = {};
      
      // Test login (this should work)
      try {
        const loginResponse = await authAPI.login('test@example.com', 'testpass');
        authTests.login = {
          status: loginResponse.success ? 'success' : 'error',
          message: loginResponse.success ? 'Login endpoint accessible' : loginResponse.error,
          needsAuth: !loginResponse.success && loginResponse.error?.includes('401')
        };
      } catch (error) {
        authTests.login = { status: 'error', message: error.message };
      }

      // Test resend OTP
      try {
        const otpResponse = await authAPI.resendOTP('9876543210');
        authTests.resendOTP = {
          status: otpResponse.success ? 'success' : 'error',
          message: otpResponse.success ? 'Resend OTP endpoint accessible' : otpResponse.error
        };
      } catch (error) {
        authTests.resendOTP = { status: 'error', message: error.message };
      }

      // Test resend email
      try {
        const emailResponse = await authAPI.resendEmailVerification('test@example.com');
        authTests.resendEmail = {
          status: emailResponse.success ? 'success' : 'error',
          message: emailResponse.success ? 'Resend email endpoint accessible' : emailResponse.error
        };
      } catch (error) {
        authTests.resendEmail = { status: 'error', message: error.message };
      }

      // Test forgot password
      try {
        const forgotResponse = await authAPI.forgotPassword('test@example.com');
        authTests.forgotPassword = {
          status: forgotResponse.success ? 'success' : 'error',
          message: forgotResponse.success ? 'Forgot password endpoint accessible' : forgotResponse.error
        };
      } catch (error) {
        authTests.forgotPassword = { status: 'error', message: error.message };
      }

      // Test reset password
      try {
        const resetResponse = await authAPI.resetPassword('test@example.com', '123456', 'newpass123');
        authTests.resetPassword = {
          status: resetResponse.success ? 'success' : 'error',
          message: resetResponse.success ? 'Reset password endpoint accessible' : resetResponse.error
        };
      } catch (error) {
        authTests.resetPassword = { status: 'error', message: error.message };
      }

      // Test signout
      try {
        const signoutResponse = await authAPI.signout();
        authTests.signout = {
          status: signoutResponse.success ? 'success' : 'error',
          message: signoutResponse.success ? 'Signout endpoint accessible' : signoutResponse.error
        };
      } catch (error) {
        authTests.signout = { status: 'error', message: error.message };
      }

      results.authentication = authTests;
    } catch (error) {
      results.authentication = { error: error.message };
    }

    // Test 2: Data APIs
    console.log('📊 Testing Data APIs...');
    try {
      const dataTests = {};

      // Test get plans
      try {
        const plansResponse = await dataAPI.getPlans();
        dataTests.getPlans = {
          status: plansResponse.success ? 'success' : 'error',
          message: plansResponse.success ? 'Get plans endpoint accessible' : plansResponse.error,
          dataCount: plansResponse.success ? (plansResponse.data?.data?.length || plansResponse.data?.length || 0) : 0
        };
      } catch (error) {
        dataTests.getPlans = { status: 'error', message: error.message };
      }

      // Test get locations by date
      try {
        const locationsResponse = await dataAPI.getLocationAvailability('2025-09-26');
        dataTests.getLocations = {
          status: locationsResponse.success ? 'success' : 'error',
          message: locationsResponse.success ? 'Get locations endpoint accessible' : locationsResponse.error,
          dataCount: locationsResponse.success ? (locationsResponse.data?.data?.length || locationsResponse.data?.length || 0) : 0
        };
      } catch (error) {
        dataTests.getLocations = { status: 'error', message: error.message };
      }

      // Test get plans by location
      try {
        const plansByLocationResponse = await dataAPI.getPlansByLocation(1);
        dataTests.getPlansByLocation = {
          status: plansByLocationResponse.success ? 'success' : 'error',
          message: plansByLocationResponse.success ? 'Get plans by location endpoint accessible' : plansByLocationResponse.error,
          dataCount: plansByLocationResponse.success ? (plansByLocationResponse.data?.data?.length || plansByLocationResponse.data?.length || 0) : 0
        };
      } catch (error) {
        dataTests.getPlansByLocation = { status: 'error', message: error.message };
      }

      // Test check availability
      try {
        const availabilityResponse = await dataAPI.checkAvailability(1, 1, '2025-09-26');
        dataTests.checkAvailability = {
          status: availabilityResponse.success ? 'success' : 'error',
          message: availabilityResponse.success ? 'Check availability endpoint accessible' : availabilityResponse.error
        };
      } catch (error) {
        dataTests.checkAvailability = { status: 'error', message: error.message };
      }

      results.data = dataTests;
    } catch (error) {
      results.data = { error: error.message };
    }

    // Test 3: File Upload APIs
    console.log('📁 Testing File Upload APIs...');
    try {
      const fileTests = {};

      // Test get signed upload URL
      try {
        const uploadUrlResponse = await filesAPI.getSignedUploadUrl('test-image.jpg', 'image/jpeg');
        fileTests.getSignedUploadUrl = {
          status: uploadUrlResponse.success ? 'success' : 'error',
          message: uploadUrlResponse.success ? 'Get signed upload URL endpoint accessible' : uploadUrlResponse.error
        };
      } catch (error) {
        fileTests.getSignedUploadUrl = { status: 'error', message: error.message };
      }

      results.files = fileTests;
    } catch (error) {
      results.files = { error: error.message };
    }

    // Test 4: Order APIs
    console.log('💳 Testing Order APIs...');
    try {
      const orderTests = {};

      // Test initiate order
      try {
        const orderData = {
          planId: '1',
          locationId: '1',
          startDate: '2025-09-26',
          creativeFilePath: 'test/path.jpg',
          creativeFileName: 'test.jpg',
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zip: '12345'
          },
          gstInfo: '27AAPCU1234A1Z5'
        };
        const initiateResponse = await ordersAPI.initiateOrder(orderData);
        orderTests.initiateOrder = {
          status: initiateResponse.success ? 'success' : 'error',
          message: initiateResponse.success ? 'Initiate order endpoint accessible' : initiateResponse.error
        };
      } catch (error) {
        orderTests.initiateOrder = { status: 'error', message: error.message };
      }

      // Test verify payment
      try {
        const verifyData = {
          orderId: '1',
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test123',
          razorpay_signature: 'test_signature'
        };
        const verifyResponse = await ordersAPI.verifyPayment(verifyData);
        orderTests.verifyPayment = {
          status: verifyResponse.success ? 'success' : 'error',
          message: verifyResponse.success ? 'Verify payment endpoint accessible' : verifyResponse.error
        };
      } catch (error) {
        orderTests.verifyPayment = { status: 'error', message: error.message };
      }

      // Test get orders
      try {
        const getOrdersResponse = await ordersAPI.getOrders();
        orderTests.getOrders = {
          status: getOrdersResponse.success ? 'success' : 'error',
          message: getOrdersResponse.success ? 'Get orders endpoint accessible' : getOrdersResponse.error,
          dataCount: getOrdersResponse.success ? (getOrdersResponse.data?.data?.length || getOrdersResponse.data?.length || 0) : 0
        };
      } catch (error) {
        orderTests.getOrders = { status: 'error', message: error.message };
      }

      results.orders = orderTests;
    } catch (error) {
      results.orders = { error: error.message };
    }

    setTestResults(results);

    // Calculate overall status
    const allTests = Object.values(results).flatMap(category => 
      Array.isArray(category) ? category : Object.values(category)
    );
    const successCount = allTests.filter(test => test.status === 'success').length;
    const totalTests = allTests.length;
    
    if (successCount === totalTests) {
      setOverallStatus('all-success');
    } else if (successCount > 0) {
      setOverallStatus('partial-success');
    } else {
      setOverallStatus('all-failed');
    }

    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'all-success': return 'text-green-800 bg-green-200';
      case 'partial-success': return 'text-yellow-800 bg-yellow-200';
      case 'all-failed': return 'text-red-800 bg-red-200';
      case 'testing': return 'text-blue-800 bg-blue-200';
      default: return 'text-gray-800 bg-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔌 API Connectivity Test</h2>
          <div className={`px-4 py-2 rounded-lg font-semibold ${getOverallStatusColor()}`}>
            {overallStatus === 'all-success' && '✅ All APIs Working'}
            {overallStatus === 'partial-success' && '⚠️ Some APIs Working'}
            {overallStatus === 'all-failed' && '❌ APIs Not Working'}
            {overallStatus === 'testing' && '🔄 Testing...'}
            {overallStatus === 'pending' && '⏳ Ready to Test'}
          </div>
        </div>

        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔄 Testing APIs...' : '🚀 Run All API Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {Object.entries(testResults).map(([category, tests]) => (
              <div key={category} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
                  {category === 'authentication' && '🔐 Authentication APIs'}
                  {category === 'data' && '📊 Data APIs'}
                  {category === 'files' && '📁 File Upload APIs'}
                  {category === 'orders' && '💳 Order APIs'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(tests).map(([testName, result]) => (
                    <div key={testName} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-600">
                          {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{result.message}</p>
                      {result.dataCount !== undefined && (
                        <p className="text-xs text-blue-600">Data items: {result.dataCount}</p>
                      )}
                      {result.needsAuth && (
                        <p className="text-xs text-orange-600">⚠️ Requires authentication</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">📋 Test Summary</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Authentication APIs:</strong> Login, Resend OTP, Resend Email, Forgot Password, Reset Password, Signout</li>
            <li>• <strong>Data APIs:</strong> Get Plans, Get Locations, Get Plans by Location, Check Availability</li>
            <li>• <strong>File APIs:</strong> Get Signed Upload URL</li>
            <li>• <strong>Order APIs:</strong> Initiate Order, Verify Payment, Get Orders</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiConnectivityTest;
