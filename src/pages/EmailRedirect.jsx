import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const API_BASE = `${API_BASE_URL}/auth`;

export default function EmailRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const selector = searchParams.get('selector');
      const validator = searchParams.get('validator');
      
      console.log('Email verification params:', { selector, validator });
      console.log('Current hostname:', window.location.hostname);
      
      if (!selector || !validator) {
        setStatus('error');
        setMessage('Invalid verification link. Missing required parameters.');
        return;
      }

      try {
        console.log('Calling verify-email API...');
        const response = await axios.post(`${API_BASE}/verify-email`, { selector, validator });
        console.log('Email verification response:', response.data);

        // Store the email verification token
        if (response.data.token) {
          localStorage.setItem('emailToken', response.data.token);
          console.log('Email token stored:', response.data.token);
        }

        setStatus('success');
        setMessage('Email verified successfully! Now verify your mobile number.');
        
        // Redirect to auth page with phone step after 3 seconds
        setTimeout(() => {
          console.log('Navigating to auth page...');
          navigate('/auth?step=phone');
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="text-green-500 text-6xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Step:</strong> Click the button below to continue with phone verification.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/auth?step=phone')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue to Phone Verification
              </button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-500 text-6xl">✗</div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-600">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
