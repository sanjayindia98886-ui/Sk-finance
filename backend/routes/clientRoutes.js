const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect } = require('../middleware/authMiddleware');

// 1. नया खाता जोड़ें
router.post('/add', protect, async (req, res) => {
    try {
        const { clientName, loanType, totalLoanAmount, totalReturnAmount, dailyInstallment, totalDays } = req.body;
        const newLoan = new Client({
            userId: req.user.id,
            clientName,
            loanType,
            totalLoanAmount: Number(totalLoanAmount) || 0,
            totalReturnAmount: Number(totalReturnAmount) || Number(totalLoanAmount) || 0, 
            dailyInstallment: Number(dailyInstallment || 0),
            totalDays: Number(totalDays || 0),
            collectedAmount: 0,
            penalty: 0,
            penaltyHistory: [], // शुरुआत में पेनल्टी हिस्ट्री खाली रहेगी
            history: [] // शुरुआत में हिस्ट्री खाली रहेगी
        });
        await newLoan.save();
        res.status(201).json(newLoan);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
});

// 2. सारा डेटा कैलकुलेशन और मास्टर स्टेट्स के साथ लाएं
router.get('/all', protect, async (req, res) => {
    try {
        const loans = await Client.find({ userId: req.user.id });
        
        let totalOutflow = 0;
        let totalInflow = 0;
        let netProfit = 0;
        let grandTotalPending = 0;

        const processedLoans = loans.map(loan => {
            const startDate = loan.startDate ? new Date(loan.startDate) : new Date();
            const today = new Date();
            const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            
            const totalDays = Number(loan.totalDays) || 0;
            const pendingDays = Math.max(0, totalDays - daysPassed);
            
            const returnAmt = Number(loan.totalReturnAmount) || Number(loan.totalLoanAmount) || 0;
            const collectedAmt = Number(loan.collectedAmount) || 0;
            const loanAmt = Number(loan.totalLoanAmount) || 0;
            
            // डेटाबेस में सेव मैन्युअल पेनल्टी को निकालें, अगर कुछ नहीं है तो 0 रहेगा
            const savedPenalty = Number(loan.penalty) || 0;
            
            // बाकी राशि = (वापसी राशि + पेनल्टी) - जमा राशि
            const pendingBalance = (returnAmt + savedPenalty) - collectedAmt;
            
            totalOutflow += loanAmt;
            totalInflow += collectedAmt;
            netProfit += (returnAmt - loanAmt);
            grandTotalPending += pendingBalance;

            return { 
                ...loan._doc, 
                totalReturnAmount: returnAmt,
                pendingDays, 
                pendingBalance, 
                penalty: savedPenalty // यहाँ सीधे डेटाबेस वाली मैन्युअल पेनल्टी जाएगी
            };
        });

        res.json({
            clients: processedLoans,
            stats: { 
                totalOutflow, 
                totalInflow, 
                netProfit, 
                totalPending: grandTotalPending 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
});

// 3. डिलीट करें
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        res.json({ message: 'खाता डिलीट हो गया!' });
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
});

// 4. पैसा जमा करें और हिस्ट्री में रिकॉर्ड जोड़ें
router.put('/collect/:id', protect, async (req, res) => {
    try {
        const loan = await Client.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: 'क्लाइंट नहीं मिला' });
        
        const amountToAdd = Number(req.body.amountReceived) || 0;
        
        // 1. कुल जमा राशि बढ़ाएं
        loan.collectedAmount = (Number(loan.collectedAmount) || 0) + amountToAdd;
        
        // 2. हिस्ट्री एरे में नया पेमेंट रिकॉर्ड डालें
        loan.history.push({
            type: 'Payment',
            amount: amountToAdd,
            date: new Date(),
            note: 'किश्त जमा की गई'
        });
        
        await loan.save();
        res.json(loan);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
});

// 5. ⚠️ बटन दबाकर पेनल्टी लगाने और उसकी हिस्ट्री रखने का नया रास्ता
router.put('/add-penalty/:id', protect, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const loan = await Client.findById(req.params.id);

        if (!loan) {
            return res.status(404).json({ message: 'क्लाइंट नहीं मिला!' });
        }

        const penaltyAmount = Number(amount) || 0;

        // अगर क्लाइंट मॉडल में penaltyHistory एरे नहीं बना है, तो उसे इनिशियलाइज़ करें
        if (!loan.penaltyHistory) {
            loan.penaltyHistory = [];
        }

        // 1. पेनल्टी हिस्ट्री में नया रिकॉर्ड जोड़ें
        loan.penaltyHistory.push({
            amount: penaltyAmount,
            date: new Date(),
            reason: reason || 'किश्त लेट होने के कारण'
        });

        // 2. कुल पेनल्टी फील्ड को अपडेट करें
        loan.penalty = (Number(loan.penalty) || 0) + penaltyAmount;

        await loan.save();
        res.json({ message: 'पेनल्टी सफलतापूर्वक जुड़ गई है!', loan });
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
});

module.exports = router;