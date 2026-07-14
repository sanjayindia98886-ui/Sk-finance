const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');

// 1. .env फाइल के वेरिएबल्स को लोड करना
dotenv.config();
connectDB();

// 2. एक्सप्रेस ऐप को शुरू करना
const app = express();

// 3. मिडलवेयर्स (Middlewares) सेट करना
app.use(cors()); // फ्रंटएंड को कनेक्ट करने की परमिशन देना
app.use(express.json()); // सर्वर को यह बताना कि डेटा JSON फॉर्मेट में आएगा
app.use('/api/auth', authRoutes);
app.use('/api/clients',require('./routes/clientRoutes.js'));
// 4. एक सिंपल टेस्टिंग रूट (चेक करने के लिए कि सर्ver चल रहा है या नहीं)
app.get('/', (req, res) => {
    res.send('संजय आपका फाइनेंस बैकएंड सर्वर एकदम सही चल रहा है!');
});

// 5. सर्वर को चालू करना
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
    console.log(`🚀 सर्वर गेट नंबर ${PORT} पर चालू हो गया है!`);
});