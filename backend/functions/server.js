const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("../firebaseConfig.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-firebase-project.firebaseio.com", // Replace with your Firebase DB URL if needed
});

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Wanderlust WebApp Backend is Running!");
});

// Example Protected Route (To be used for role-based access later)
app.get("/protected", async (req, res) => {
  const token = req.headers.authorization?.split("Bearer ")[1]; // Extract token from request headers

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token); // Verify Firebase token
    return res.status(200).json({ message: "Access granted", user: decodedToken });
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized - Invalid token" });
  }
});

// Define the Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Firebase Connected ✅");
});
