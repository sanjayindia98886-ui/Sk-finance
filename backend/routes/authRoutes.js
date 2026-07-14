const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 
const bcrypt = require('bcryptjs'); 
const User = require('../models/User'); 

const { registerUser, loginUser, getUserProfile, updateCompanyName } = authController;

// Route for registering a new user
router.post('/register', registerUser || authController.registerUser);

// Route for user login
router.post('/login', loginUser || authController.loginUser);

// Route to get logged-in user's profile
router.get('/me', protect, getUserProfile || authController.getUserProfile);

// Route to update user's company name
router.put('/update-company', protect, updateCompanyName);

// Route to reset password if forgotten
router.put('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'This email is not registered!' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ message: 'Password reset successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
});

// Admin Route: Get list of all users (Super Admin only)
router.get('/admin/users', protect, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized access! You are not a super admin.' });
        }

        const users = await User.find({ role: { $ne: 'super_admin' } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
});

// Admin Route: Update user approval and payment status
router.put('/admin/update-status/:id', protect, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (adminUser.role !== 'super_admin') {
            return res.status(403).json({ message: 'Unauthorized access!' });
        }

        const { isApproved, paymentStatus } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved, paymentStatus },
            { new: true }
        ).select('-password');

        res.json({ message: 'User status updated successfully!', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
});

module.exports = router;
