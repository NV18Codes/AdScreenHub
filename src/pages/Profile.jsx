import React, { useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    gstNumber: user?.gstNumber || ''
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

  const handleSaveProfile = async () => {
    try {
      // TODO: API call to update profile
      console.log('Updating profile:', formData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdatePassword = async () => {
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
      // TODO: API call to update password
      console.log('Updating password');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Show success message
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to confirm account deletion');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('https://2yuh2s8tyv.us-east-1.awsapprunner.com/api/v1/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      if (response.ok) {
        alert('Account deleted successfully');
        logout();
      } else {
        const error = await response.json();
        alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.profileLayout}>
          {/* Account Information Section */}
          <div className={styles.accountSection}>
            <div className={styles.sectionHeader}>
              <h2>Account Information</h2>
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
                    onClick={() => setIsEditing(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className={styles.saveButton}
                  >
                    Save
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
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.fullName}</span>
                )}
              </div>
              
              <div className={styles.field}>
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.email}</span>
                )}
              </div>
              
              <div className={styles.field}>
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.phoneNumber}</span>
                )}
              </div>
              
              <div className={styles.field}>
                <label>GST Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter GST number"
                  />
                ) : (
                  <span className={styles.fieldValue}>{formData.gstNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
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
                disabled={isUpdatingPassword}
                className={styles.updatePasswordButton}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            {/* Danger Zone Section */}
            <div className={styles.dangerZone}>
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
