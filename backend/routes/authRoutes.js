const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // सुरक्षा मिडलवेयर
const bcrypt = require('bcryptjs'); // पासवर्ड हैश करने के लिए
const User = require('../models/User'); // यूजर मॉडल
const { registerUser, loginUser, getUserProfile, updateCompanyName } = require('../controllers/authController');

// नया यूजर रजिस्टर करने का रास्ता
router.post('/register', authController.registerUser);

// USER लॉगिन करने का रास्ता
router.post('/login', authController.loginUser);

// लॉगिन किए हुए यूजर की प्रोफाइल निकालने का रास्ता
router.get('/me', protect, authController.getUserProfile);

router.put('/update-company', protect, updateCompanyName);

// 🔒 पासवर्ड भूल जाने पर रिसेट करने का रास्ता
router.put('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        // 1. यूजर को ईमेल से ढूंढें
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'यह ईमेल रजिस्टर नहीं है!' });
        }

        // 2. नए पासवर्ड को हैश करें
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 3. नया पासवर्ड डेटाबेस में सेव करें
        await user.save();
        res.json({ message: 'पासवर्ड सफलतापूर्वक बदल गया है!' });
    } catch (error) {
        res.status(500).json({ message: 'सर्वर एरर: ' + error.message });
    }
});

// 🟢 [नया राउट 1]: सभी यूज़र्स की लिस्ट निकालना (सिर्फ सुपर एडमिन देख पाएगा)
router.get('/admin/users', protect, async (req, res) => {
    try {
        // चेक करें कि रिक्वेस्ट करने वाला खुद super_admin है या नहीं
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'super_admin') {
            return res.status(403).json({ message: 'अनऑथराइज्ड एक्सेस! आप सुपर एडमिन नहीं हैं।' });
        }

        // खुद सुपर एडमिन को छोड़कर बाकी सभी यूज़र्स की लिस्ट निकालें
        const users = await User.find({ role: { $ne: 'super_admin' } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'सर्वर एरर: ' + error.message });
    }
});

// 🟢 [नया राउट 2]: यूजर का स्टेटस अपडेट करना (Approve और Payment Status 'Paid' करना)
router.put('/admin/update-status/:id', protect, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'super_admin') {
            return res.status(403).json({ message: 'अनऑथराइज्ड एक्सेस!' });
        }

        const { isApproved, paymentStatus } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved, paymentStatus },
            { new: true }
        ).select('-password');

        res.json({ message: 'यूजर स्टेटस सफलतापूर्वक अपडेट हुआ!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'सर्वर एरर: ' + error.message });
    }
});

module.exports = router;