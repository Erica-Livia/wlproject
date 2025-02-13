require('dotenv').config();
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const credentials = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send the Welcome Email
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
app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const userResponse = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            emailVerified: true,
            disabled: false
        });

        // sending welcome email
        await sendWelcomeEmail(email, firstName);

        res.json({ message: "User created successfully. Welcome email sent!", user: userResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// token verification
app.post('/verifyToken', async (req, res) => {
    const { token } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.status(200).json({ message: "Token verified", userId: decodedToken.uid, email: decodedToken.email });
    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
    }

    try {
        // Verify ID token from the frontend
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        // Fetch user role from Firestore
        const userRecord = await admin.auth().getUser(uid);
        const role = userRecord.customClaims?.role || 'visitor';  // Default role

        res.json({ uid, email, role, message: 'Login successful' });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

//server starting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});