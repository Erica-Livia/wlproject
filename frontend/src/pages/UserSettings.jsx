import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

function UserSettings() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Set initial values
    if (auth.currentUser) {
      setEmail(auth.currentUser.email);
    }
  }, []);

  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressPercent);
        },
        (err) => {
          setError('Error uploading profile picture');
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
          setSuccess('Profile picture updated successfully');
        }
      );
    }
  };

  // Handle email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEmail(auth.currentUser, email);
      setSuccess('Email updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUser(auth.currentUser);
        navigate('/login'); // Redirect to login page after account deletion
      } catch (err) {
        setError('Error deleting account');
      }
    }
  };

  return (
    <div className="user-settings-page container mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">User Settings</h2>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <div className="profile-info mb-6">
        <h3 className="text-xl font-medium mb-4">Profile Information</h3>
        <div className="flex items-center mb-4">
          <img
            src={'/placeholder.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-4"
          />
          <div>
            <input
              type="file"
              onChange={handleProfilePicUpload}
              className="hidden"
              id="profilePic"
            />
            <label htmlFor="profilePic" className="bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer">
              Upload New Profile Picture
            </label>
            <p className="text-sm mt-2">Progress: {progress}%</p>
          </div>
        </div>
      </div>

      <div className="update-email mb-6">
        <h3 className="text-xl font-medium mb-4">Update Email</h3>
        <form onSubmit={handleEmailUpdate}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
            Update Email
          </button>
        </form>
      </div>

      <div className="update-password mb-6">
        <h3 className="text-xl font-medium mb-4">Update Password</h3>
        <form onSubmit={handlePasswordUpdate}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full p-2 border rounded-lg mb-4"
            required
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
            Update Password
          </button>
        </form>
      </div>

      <div className="delete-account mb-6">
        <h3 className="text-xl font-medium mb-4">Delete Account</h3>
        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default UserSettings;
