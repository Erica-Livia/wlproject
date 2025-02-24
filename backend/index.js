require('dotenv').config();
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require('cors');
const credentials = require("./serviceAccountKey.json");
const bodyParser = require('body-parser');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

// Initialize Firestore
const db = admin.firestore();


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON body
app.use(bodyParser.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send welcome email function
const sendWelcomeEmail = async (email, firstName) => {
    try {
        await transporter.sendMail({
            from: '"Wanderlust WebApp" <ingabireericalivia@gmail.com>',
            to: email,
            subject: "Welcome to Wanderlust!",
            html: `<h3>Hello ${firstName},</h3>
                   <p>Welcome to Wanderlust! We are excited to have you.\nStart exploring amazing destinations today!</p>
                   <br>
                   <p>Best Regards,</p>
                   <p>The Wanderlust Team</p>`
        });
        console.log("Welcome email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, firstName, and lastName are required" });
    }

    const displayName = `${firstName} ${lastName}`;

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: false
        });

        // Create user document in Firestore with firstName, lastName, and default role
        await db.collection('users').doc(userRecord.uid).set({
            email,
            firstName,
            lastName,
            role: 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Set custom claims for Firebase Auth
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });

        // Send welcome email
        await sendWelcomeEmail(email, firstName);

        res.status(201).json({
            message: "User created successfully",
            uid: userRecord.uid,
            role: 'user'
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(400).json({
            error: error.message || "Failed to create user"
        });
    }
});


// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        
        if (!userDoc.exists) {
            await db.collection('users').doc(userRecord.uid).set({
                email: userRecord.email,
                role: 'user',
                name: userRecord.displayName || '',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        const userData = userDoc.exists ? userDoc.data() : { role: 'user' };

        // Send response with user data
        res.json({
            uid: userRecord.uid,
            email: userRecord.email,
            role: userData.role || 'user',
            displayName: userRecord.displayName || ''
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({ 
            error: "Invalid credentials" 
        });
    }
});

//endpoint to update user role (admin only)
app.post('/api/updateRole', async (req, res) => {
    const { uid, newRole } = req.body;
    const adminToken = req.headers.authorization?.split('Bearer ')[1];

    try {
        // Verify admin token
        const decodedToken = await admin.auth().verifyIdToken(adminToken);
        const adminDoc = await db.collection('users').doc(decodedToken.uid).get();
        
        if (adminDoc.data().role !== 'admin') {
            throw new Error('Unauthorized');
        }

        // Update role in Firestore
        await db.collection('users').doc(uid).update({
            role: newRole
        });

        // Update custom claims
        await admin.auth().setCustomUserClaims(uid, { role: newRole });

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error("Role update error:", error);
        res.status(403).json({ error: 'Unauthorized to update roles' });
    }
});


// Verify token middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});