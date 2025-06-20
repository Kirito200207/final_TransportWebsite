import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faUserEdit,
  faSave,
  faTimes,
  faCamera,
  faLanguage,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfilePage.css';

const ProfilePage = ({ isActive, onClose, currentUser }) => {
  const [profile, setProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '+1 234 567 8900',
    preferredLanguage: 'English',
    address: '123 Main Street, New York, NY 10001',
    profileImage: '/img2/KHCFDC_头像 2.png'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const languages = ['English', 'Spanish', 'French', 'German'];

  // 获取用户信息
  useEffect(() => {
    // 优先使用传入的currentUser
    if (currentUser) {
      setProfile(prevProfile => ({
        ...prevProfile,
        username: currentUser.username || '',
        firstName: currentUser.first_name || currentUser.username || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email || ''
      }));
      console.log('使用传入的用户信息:', currentUser);
    } else {
      // 如果没有传入currentUser，则从localStorage获取
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setProfile(prevProfile => ({
            ...prevProfile,
            username: user.username || '',
            firstName: user.first_name || user.username || '',
            lastName: user.last_name || '',
            email: user.email || ''
          }));
          console.log('从localStorage获取用户信息:', user);
        } catch (err) {
          console.error('解析用户信息出错:', err);
        }
      }
    }
  }, [currentUser]);

  if (!isActive) return null;

  const handleEditClick = () => {
    setEditedProfile({...profile});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    setLoading(true);
    setError(null);

    try {
      setTimeout(() => {
        setProfile(editedProfile);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully');
        setLoading(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }, 1000);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProfile(prev => ({
        ...prev,
        profileImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // 显示用户名或全名
  const displayName = profile.username || (profile.firstName + ' ' + profile.lastName).trim();

  return (
    <div className="profile-modal">
      <div className="profile-content">
        <div className="profile-header">
          <button className="back-button" onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h2>Profile</h2>
          {!isEditing && (
            <button className="edit-button" onClick={handleEditClick}>
              <FontAwesomeIcon icon={faUserEdit} />
            </button>
          )}
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="profile-body">
          <div className="profile-image-section">
            <div className="profile-image-container">
              <img
                src={isEditing ? editedProfile.profileImage : profile.profileImage}
                alt="Profile"
                className="profile-image"
              />
              {isEditing && (
                <div className="image-upload">
                  <label htmlFor="image-upload">
                    <FontAwesomeIcon icon={faCamera} />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <div className="field-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              {isEditing ? (
                <div className="name-inputs">
                  <input
                    type="text"
                    name="username"
                    value={editedProfile.username || ''}
                    onChange={handleInputChange}
                    placeholder="Username"
                    disabled={true}
                  />
                </div>
              ) : (
                <div className="field-value">{displayName}</div>
              )}
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email || ''}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              ) : (
                <div className="field-value">{profile.email}</div>
              )}
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedProfile.phone || ''}
                  onChange={handleInputChange}
                  placeholder="Phone"
                />
              ) : (
                <div className="field-value">{profile.phone}</div>
              )}
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={editedProfile.address || ''}
                  onChange={handleInputChange}
                  placeholder="Address"
                />
              ) : (
                <div className="field-value">{profile.address}</div>
              )}
            </div>

            <div className="profile-field">
              <div className="field-icon">
                <FontAwesomeIcon icon={faLanguage} />
              </div>
              {isEditing ? (
                <select
                  name="preferredLanguage"
                  value={editedProfile.preferredLanguage || ''}
                  onChange={handleInputChange}
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              ) : (
                <div className="field-value">{profile.preferredLanguage}</div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="save-button" onClick={handleSaveChanges}>
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 