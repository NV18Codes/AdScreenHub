import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Phone/Email OTP states
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gstNumber: ''
  });
  
  // Track original values to detect changes
  const [originalFormData, setOriginalFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gstNumber: ''
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMessage('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fetch complete profile data from backend (includes phone_number and gst_info)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          // Fallback to user context
          if (user) {
            const updatedData = {
              fullName: user.full_name || user.fullName || '',
              email: user.email || '',
              phoneNumber: user.phone_number || user.phoneNumber || '',
              gstNumber: user.gst_info || user.gstInfo || ''
            };
            setFormData(updatedData);
            setOriginalFormData(updatedData);
          }
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        if (result.success && result.data) {
          const profileData = result.data;
          
          const updatedData = {
            fullName: profileData.full_name || '',
            email: profileData.email || '',
            phoneNumber: profileData.phone_number || '',
            gstNumber: profileData.gst_info || ''
          };
          
          setFormData(updatedData);
          setOriginalFormData(updatedData);
          
          // Update user context with complete data
          if (updateUser) {
            updateUser({
              ...user,
              fullName: profileData.full_name,
              full_name: profileData.full_name,
              email: profileData.email,
              phoneNumber: profileData.phone_number,
              phone_number: profileData.phone_number,
              gstInfo: profileData.gst_info,
              gst_info: profileData.gst_info
            });
          }
        } else {
          // Fallback to user context
          if (user) {
            const updatedData = {
              fullName: user.full_name || user.fullName || '',
              email: user.email || '',
              phoneNumber: user.phone_number || user.phoneNumber || '',
              gstNumber: user.gst_info || user.gstInfo || ''
            };
            setFormData(updatedData);
            setOriginalFormData(updatedData);
          }
        }
      } catch (error) {
        // Fallback to user context
        if (user) {
          const updatedData = {
            fullName: user.full_name || user.fullName || '',
            email: user.email || '',
            phoneNumber: user.phone_number || user.phoneNumber || '',
            gstNumber: user.gst_info || user.gstInfo || ''
          };
          setFormData(updatedData);
          setOriginalFormData(updatedData);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      
      const emailChanged = formData.email !== originalFormData.email;
      const phoneChanged = formData.phoneNumber !== originalFormData.phoneNumber;
      const nameChanged = formData.fullName !== originalFormData.fullName;
      const gstChanged = formData.gstNumber !== originalFormData.gstNumber;
      
      // If no changes were made
      if (!emailChanged && !phoneChanged && !nameChanged && !gstChanged) {
        setErrorMessage('No changes detected');
        setIsEditing(false);
        return;
      }
      
      // Prevent updating email AND phone at the same time
      if (emailChanged && phoneChanged) {
        setErrorMessage('Please update email or phone number one at a time, not both together.');
        return;
      }
      
      // If email changed (with or without name/GST), start email OTP process
      if (emailChanged) {
        const emailResponse = await fetch(`${API_BASE_URL}/auth/start-email-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newEmail: formData.email })
        });
        
        const emailData = await emailResponse.json();
        if (emailData.success) {
          setNewEmail(formData.email);
          setShowEmailOTP(true);
          setSuccessMessage('OTP sent to new email. Please verify to continue.');
          return;
        } else {
          throw new Error(emailData.message || 'Failed to send email OTP');
        }
      }
      
      // If phone changed (with or without name/GST), start phone OTP process
      if (phoneChanged) {
        const phoneResponse = await fetch(`${API_BASE_URL}/auth/start-phone-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newPhoneNumber: formData.phoneNumber })
        });
        
        const phoneData = await phoneResponse.json();
        if (phoneResponse.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        if (phoneData.success) {
          setNewPhone(formData.phoneNumber);
          setShowPhoneOTP(true);
          setSuccessMessage('OTP sent to new phone number. Please verify to continue.');
          return;
        } else {
          throw new Error(phoneData.message || 'Failed to send phone OTP');
        }
      }
      
      // Update name and/or GST (no OTP required)
      if (nameChanged || gstChanged) {
        const updatePayload = {
          fullName: formData.fullName,
          gstInfo: formData.gstNumber
        };
        
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatePayload)
        });
        
        const data = await response.json();
        if (data.success || response.ok) {
          setSuccessMessage('Profile updated successfully!');
          setIsEditing(false);
          setOriginalFormData(formData);
          if (updateUser) {
            updateUser({ 
              ...user, 
              fullName: formData.fullName, 
              full_name: formData.fullName,
              gstInfo: formData.gstNumber, 
              gstNumber: formData.gstNumber 
            });
          }
        } else {
          throw new Error(data.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile');
    }
  };

  const handleVerifyPhoneOTP = async () => {
    try {
      setErrorMessage('');
      const token = localStorage.getItem('token');
      
      // Step 1: Verify phone OTP
      const response = await fetch(`${API_BASE_URL}/auth/complete-phone-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPhoneNumber: newPhone,
          otp: phoneOTP
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Step 2: If name or GST also changed, update those
        const nameChanged = formData.fullName !== originalFormData.fullName;
        const gstChanged = formData.gstNumber !== originalFormData.gstNumber;
        
        if (nameChanged || gstChanged) {
          const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fullName: formData.fullName,
              gstInfo: formData.gstNumber
            })
          });
          
          const profileData = await profileResponse.json();
          if (!profileData.success) {
            throw new Error('Phone updated but failed to update profile info');
          }
        }
        
        setSuccessMessage('Profile updated successfully!');
        setShowPhoneOTP(false);
        setPhoneOTP('');
        setIsEditing(false);
        setOriginalFormData(formData); // Update original data after successful save
        if (updateUser) {
          updateUser({ ...user, phoneNumber: newPhone, fullName: formData.fullName, gstInfo: formData.gstNumber });
        }
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to verify OTP');
    }
  };

  const handleVerifyEmailOTP = async () => {
    try {
      setErrorMessage('');
      const token = localStorage.getItem('token');
      
      // Step 1: Verify email OTP
      const response = await fetch(`${API_BASE_URL}/auth/complete-email-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newEmail: newEmail,
          otp: emailOTP
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Step 2: If name or GST also changed, update those
        const nameChanged = formData.fullName !== originalFormData.fullName;
        const gstChanged = formData.gstNumber !== originalFormData.gstNumber;
        
        if (nameChanged || gstChanged) {
          const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fullName: formData.fullName,
              gstInfo: formData.gstNumber
            })
          });
          
          const profileData = await profileResponse.json();
          if (!profileData.success) {
            throw new Error('Email updated but failed to update profile info');
          }
        }
        
        setSuccessMessage('Profile updated successfully!');
        setShowEmailOTP(false);
        setEmailOTP('');
        setIsEditing(false);
        setOriginalFormData(formData); // Update original data after successful save
        if (updateUser) {
          updateUser({ ...user, email: newEmail, fullName: formData.fullName, gstInfo: formData.gstNumber });
        }
      } else {
        throw new Error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to verify OTP');
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(data.message || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setPasswordError('Please enter your password to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      const data = await response.json();
      if (data.success) {
        logout();
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setPasswordError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        {successMessage && (
          <div className={styles.successBanner}>
            ✅ {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className={styles.errorBanner}>
            ❌ {errorMessage}
          </div>
        )}
        
        <div className={styles.profileLayout}>
          {/* Basic Information - No OTP Required */}
          <div className={styles.accountSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Basic Information</h2>
                <p className={styles.sectionHint}>✓ Updates instantly without verification</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  Edit
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(originalFormData);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className={styles.saveButton}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className={styles.accountFields}>
              <div className={styles.field}>
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.fullName}</span>
                )}
              </div>

              <div className={styles.field}>
                <label>GST Number <span className={styles.optionalBadge}>Optional</span></label>
                {isEditing ? (
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter GST number (if applicable)"
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.gstNumber || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Email Update - OTP Required */}
          <div className={styles.accountSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Email Address</h2>
                <p className={styles.sectionHint}>🔒 Requires OTP verification</p>
              </div>
              {!showEmailOTP && (
                <button
                  onClick={() => setShowEmailOTP(true)}
                  className={styles.editButton}
                >
                  Update Email
                </button>
              )}
            </div>

            <div className={styles.accountFields}>
              {!showEmailOTP ? (
                <div className={styles.field}>
                  <label>Current Email</label>
                  <span className={styles.fieldValue}>{formData.email}</span>
                </div>
              ) : (
                <>
                  <div className={styles.field}>
                    <label>New Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Enter new email address"
                    />
                  </div>
                  
                  <div className={styles.otpActions}>
                    <button
                      onClick={handleSaveProfile}
                      className={styles.sendOtpButton}
                      disabled={formData.email === originalFormData.email}
                    >
                      Send OTP
                    </button>
                    <button
                      onClick={() => {
                        setShowEmailOTP(false);
                        setFormData(originalFormData);
                        setEmailOTP('');
                        setNewEmail('');
                      }}
                      className={styles.cancelSmallButton}
                    >
                      Cancel
                    </button>
                  </div>

                  {newEmail && (
                    <div className={styles.otpSection}>
                      <label>Enter OTP sent to {newEmail}</label>
                      <div className={styles.otpInputGroup}>
                        <input
                          type="text"
                          value={emailOTP}
                          onChange={(e) => setEmailOTP(e.target.value)}
                          className={styles.input}
                          placeholder="6-digit OTP"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyEmailOTP}
                          className={styles.verifyButton}
                          disabled={emailOTP.length !== 6}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Phone Update - OTP Required */}
          <div className={styles.accountSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Phone Number</h2>
                <p className={styles.sectionHint}>🔒 Requires OTP verification</p>
              </div>
              {!showPhoneOTP && (
                <button
                  onClick={() => setShowPhoneOTP(true)}
                  className={styles.editButton}
                >
                  Update Phone
                </button>
              )}
            </div>

            <div className={styles.accountFields}>
              {!showPhoneOTP ? (
                <div className={styles.field}>
                  <label>Current Phone</label>
                  <span className={styles.fieldValue}>{formData.phoneNumber}</span>
                </div>
              ) : (
                <>
                  <div className={styles.field}>
                    <label>New Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Enter new phone number"
                    />
                  </div>
                  
                  <div className={styles.otpActions}>
                    <button
                      onClick={handleSaveProfile}
                      className={styles.sendOtpButton}
                      disabled={formData.phoneNumber === originalFormData.phoneNumber}
                    >
                      Send OTP
                    </button>
                    <button
                      onClick={() => {
                        setShowPhoneOTP(false);
                        setFormData(originalFormData);
                        setPhoneOTP('');
                        setNewPhone('');
                      }}
                      className={styles.cancelSmallButton}
                    >
                      Cancel
                    </button>
                  </div>

                  {newPhone && (
                    <div className={styles.otpSection}>
                      <label>Enter OTP sent to {newPhone}</label>
                      <div className={styles.otpInputGroup}>
                        <input
                          type="text"
                          value={phoneOTP}
                          onChange={(e) => setPhoneOTP(e.target.value)}
                          className={styles.input}
                          placeholder="6-digit OTP"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyPhoneOTP}
                          className={styles.verifyButton}
                          disabled={phoneOTP.length !== 6}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className={styles.passwordSection}>
              <h2>Change Password</h2>

              <div className={styles.passwordFields}>
                <div className={styles.field}>
                  <label>Current Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className={styles.eyeButton}
                    >
                      {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className={styles.eyeButton}
                    >
                      {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Confirm New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={styles.input}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className={styles.eyeButton}
                    >
                      {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className={styles.errorMessage}>
                  {passwordError}
                </div>
              )}

              <button
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className={styles.updatePasswordButton}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

          {/* Danger Zone Section - Full Width */}
          <div className={`${styles.dangerZone} ${styles.fullWidthSection}`}>
              <h2>Danger Zone</h2>
              <p>Deleting your account is permanent and cannot be undone. All your data will be removed.</p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className={styles.deleteButton}
              >
                Delete My Account
              </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Confirm Account Deletion</h3>
              <p>Are you absolutely sure you want to delete your account? This action is irreversible.</p>

              <div className={styles.modalFields}>
                <div className={styles.field}>
                  <label>Enter your password to confirm:</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className={styles.confirmDeleteButton}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}