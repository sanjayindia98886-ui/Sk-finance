const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // एक ईमेल से एक ही यूजर रजिस्टर हो पाएगा
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    // 👑 3-Tier Roles: 'super_admin' (आप), 'admin' (दुकानदार/क्लाइंट), 'employee' (वर्कर)
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'employee'],
        default: 'employee'
    },
    // 🏢 यह सिर्फ वर्कर्स के लिए होगा, जिससे पता चलेगा कि वो किस एडमिन (मालिक) के नीचे काम कर रहे हैं
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // 🟢 [नया एडिशन] सुपर एडमिन अप्रूवल स्टेटस 
    // (अगर रजिस्टर होने वाला super_admin है तो अपने आप true, बाकी सबके लिए डिफ़ॉल्ट रूप से false रहेगा)
    isApproved: {
        type: Boolean,
        default: function() {
            return this.role === 'super_admin'; 
        }
    },
    // 🟢 [नया एडिशन] लाइसेंस पेमेंट स्टेटस
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Pending'],
        default: function() {
            return this.role === 'super_admin' ? 'Paid' : 'Unpaid';
        }
    },
    // 🗓️ लाइसेंस सिस्टम (SaaS Model) - सिर्फ क्लाइंट्स (Admin) के लिए काम आएगा
    licenseStatus: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    licenseValidUntil: {
        type: Date,
        default: () => {
            // आज की तारीख से ठीक 1 साल आगे की तारीख अपने आप सेट हो जाएगी
            let date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            return date;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// इस ढांचे को 'User' नाम से एक्सपोर्ट करना ताकि हम इसे कंट्रोलर में यूज कर सकें
module.exports = mongoose.model('User', userSchema);