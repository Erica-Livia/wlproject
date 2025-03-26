require('dotenv').config();
const express = require("express");
const app = express();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Stripe Payment Intent Endpoint with BIF to USD Conversion
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, bookingId, isBIF } = req.body;
        
        // Validate input
        if (!amount || !bookingId) {
            return res.status(400).json({ error: "Amount and bookingId are required" });
        }

        // Verify booking exists
        const bookingRef = db.collection('bookings').doc(bookingId);
        const bookingDoc = await bookingRef.get();
        
        if (!bookingDoc.exists) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Currency conversion and validation
        const BIF_TO_USD_RATE = 2500; // 1 USD = 2500 BIF
        let paymentAmount;
        let paymentCurrency = 'usd'; // Stripe only accepts USD in Burundi

        if (isBIF) {
            // Convert BIF to USD cents
            paymentAmount = Math.round((amount / BIF_TO_USD_RATE) * 100);
            
            // Validate minimum amount (e.g., $1 minimum)
            if (paymentAmount < 100) {
                return res.status(400).json({ 
                    error: `Amount too small. Minimum payment is ${formatBIF(BIF_TO_USD_RATE * 1)} (≈ $1 USD)`
                });
            }
        } else {
            // Assume amount is already in USD
            paymentAmount = Math.round(amount * 100);
        }

        // Verify the converted amount matches the booking amount within tolerance
        const bookingPrice = bookingDoc.data().price; // Original price in BIF
        const expectedUSD = bookingPrice / BIF_TO_USD_RATE;
        const amountDifference = Math.abs((paymentAmount/100) - expectedUSD);
        
        if (amountDifference > 1.00) { // Allow $1 variance
            return res.status(400).json({ 
                error: `Payment amount mismatch. Expected ≈ $${expectedUSD.toFixed(2)} USD for ${formatBIF(bookingPrice)}`
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: paymentAmount,
            currency: paymentCurrency,
            metadata: { 
                bookingId,
                originalAmountBIF: isBIF ? amount : bookingPrice,
                originalCurrency: 'bif',
                convertedAmountUSD: (paymentAmount/100).toFixed(2),
                userId: bookingDoc.data().userId 
            },
            description: `Payment for booking ${bookingId}`,
            payment_method_types: ['card']
        });

        res.json({ 
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount / 100, // Return amount in dollars
            currency: paymentIntent.currency,
            originalAmount: isBIF ? amount : null,
            originalCurrency: isBIF ? 'bif' : null
        });

    } catch (error) {
        console.error("Payment intent error:", error);
        res.status(500).json({ 
            error: "Payment processing error",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Helper function to format BIF amounts
function formatBIF(amount) {
    return new Intl.NumberFormat('bi-BI', {
        style: 'currency',
        currency: 'BIF',
        minimumFractionDigits: 0
    }).format(amount);
}

// Webhook for successful payments
app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        try {
            // Update booking status in Firestore
            const bookingId = paymentIntent.metadata.bookingId;
            await db.collection('bookings').doc(bookingId).update({
                status: "Paid",
                paymentId: paymentIntent.id,
                paidAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Booking ${bookingId} marked as paid`);
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    }

    res.json({ received: true });
});

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

        // Create user document in Firestore
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
        const userRecord = await admin.auth().getUserByEmail(email);
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

// Update booking status after payment (alternative to webhook)
app.post('/api/bookings/pay', async (req, res) => {
    const { bookingId, paymentId } = req.body;
    if (!bookingId || !paymentId) {
        return res.status(400).json({ error: "Booking ID and payment ID are required" });
    }

    try {
        // Verify the payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: "Payment not completed" });
        }

        // Update booking status
        await db.collection('bookings').doc(bookingId).update({
            status: "Paid",
            paymentId: paymentIntent.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Booking marked as paid" });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({ error: "Failed to update booking" });
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