const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Matched auth import style

// Temporary in-memory storage (later we will replace with MongoDB)
let transactionDatabase = [];

// =========================================================================
// 1. PROCESS TRANSACTION
// POST /api/payments/transaction
// =========================================================================
router.post('/transaction', protect, (req, res) => {
    try {
        const { type, amount, recipientEmail } = req.body;

        // Validation
        if (!type || amount === undefined) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Please fill in all required fields (type, amount)." 
            });
        }

        if (!['deposit', 'withdraw', 'transfer'].includes(type)) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Invalid type. Must be deposit, withdraw, or transfer." 
            });
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Transaction amount must be a valid number greater than zero." 
            });
        }

        if (type === 'transfer') {
            if (!recipientEmail) {
                return res.status(400).json({ 
                    status: "Error", 
                    msg: "Recipient email is required for secure account transfers." 
                });
            }
            if (recipientEmail.toLowerCase() === req.user.email.toLowerCase()) {
                return res.status(400).json({ 
                    status: "Error", 
                    msg: "Cannot transfer money to your own account." 
                });
            }
        }

        const newTransaction = {
            id: `tx_${Date.now()}`,
            userEmail: req.user.email.toLowerCase(),
            type,
            amount: parsedAmount,
            recipientEmail: type === 'transfer' ? recipientEmail.toLowerCase() : null,
            status: "Completed",
            createdAt: new Date()
        };

        transactionDatabase.push(newTransaction);

        return res.status(201).json({
            status: "Success",
            msg: "Transaction processed successfully!",
            transaction: newTransaction
        });

    } catch (error) {
        console.error("Transaction Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

// =========================================================================
// 2. GET TRANSACTION HISTORY
// GET /api/payments/history
// =========================================================================
router.get('/history', protect, (req, res) => {
    try {
        const currentUserEmail = req.user.email.toLowerCase();

        const userHistory = transactionDatabase.filter(tx => 
            tx.userEmail === currentUserEmail || tx.recipientEmail === currentUserEmail
        );

        return res.status(200).json({
            status: "Success",
            totalTransactions: userHistory.length,
            history: userHistory
        });
        
    } catch (error) {
        console.error("Fetch History Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

module.exports = router;
