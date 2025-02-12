const express = require('express');
const router = express.Router();
const admin = require('../utils/firebaseAdmin');
const verifyToken = require('../auth/authMiddleware');
const checkRole = require('../auth/roleMiddleware');
const storeUserData = require('../db/dbConfig');

// Registration Route
router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await storeUserData(userRecord.uid, role);  // Store role in Firestore
    res.status(201).json({ message: 'User registered successfully', userId: userRecord.uid });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Protected Route: Only accessible by Admin
router.post('/manage-guides', verifyToken, checkRole('admin'), (req, res) => {
  res.status(200).json({ message: 'You have admin access!' });
});

module.exports = router;
