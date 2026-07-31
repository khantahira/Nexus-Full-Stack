const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); 
const Transaction = require('../models/Transaction'); // Imported the MongoDB Model

// =========================================================================
// 1. PROCESS TRANSACTION (POST /api/payments/transaction)
// =========================================================================
router.post('/transaction', protect, async (req, res) => {
    try {
        const { type, amount, recipientEmail } = req.body;

        if (!type || amount === undefined) {
            return res.status(400).json({ status: "Error", msg: "Please fill in all required fields." });
        }

        if (!['deposit', 'withdraw', 'transfer'].includes(type)) {
            return res.status(400).json({ status: "Error", msg: "Invalid transaction type." });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ status: "Error", msg: "Amount must be a valid number greater than zero." });
        }

        if (type === 'transfer') {
            if (!recipientEmail) {
                return res.status(400).json({ status: "Error", msg: "Recipient email is required for transfers." });
            }
            if (recipientEmail.toLowerCase() === req.user.email.toLowerCase()) {
                return res.status(400).json({ status: "Error", msg: "Cannot transfer money to your own account." });
            }
        }

        // Save directly to MongoDB database cloud instead of local array!
        const newTransaction = await Transaction.create({
            userEmail: req.user.email,
            type,
            amount: parsedAmount,
            recipientEmail: type === 'transfer' ? recipientEmail : null
        });

        return res.status(201).json({
            status: "Success",
            msg: "Transaction saved to cloud database!",
            transaction: newTransaction
        });

    } catch (error) {
        console.error("Transaction DB Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error" });
    }
});

// =========================================================================
// 2. GET TRANSACTION HISTORY (GET /api/payments/history)
// =========================================================================
router.get('/history', protect, async (req, res) => {
    try {
        const currentUserEmail = req.user.email.toLowerCase();

        // Query MongoDB for records matching the active user
        const userHistory = await Transaction.find({
            $or: [
                { userEmail: currentUserEmail },
                { recipientEmail: currentUserEmail }
            ]
        }).sort({ createdAt: -1 }); // Newest transactions show first

        return res.status(200).json({
            status: "Success",
            totalTransactions: userHistory.length,
            history: userHistory
        });
        
    } catch (error) {
        console.error("Fetch History DB Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error" });
    }
});

module.exports = router;
