const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Load Firebase Admin SDK service account key
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST route to send a ringing FCM notification
app.post('/sendRingingNotification', async (req, res) => {
    const { fcmToken, channel } = req.body;

    // Validate input
    if (!fcmToken || !channel) {
        return res.status(400).send('❌ Missing fcmToken or channel.');
    }

    console.log("📨 Sending notification to token:", fcmToken);
    console.log("📞 Channel (caller):", channel);

    const message = {
        notification: {
            title: '📞 Incoming Video Call',
            body: `You have an incoming call from ${channel}`,
        },
        android: {
            priority: "high",
            notification: {
                sound: "default",
            },
        },
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Successfully sent message:", response);
        return res.status(200).send('✅ Notification sent.');
    } catch (error) {
        console.error("❌ Error sending message:", JSON.stringify(error, null, 2));
        return res.status(500).send(`❌ Error sending notification: ${error.message}`);
    }
});

// Basic health check
app.get('/', (req, res) => {
    res.send('🚀 FCM Notification Server is up and running!');
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
