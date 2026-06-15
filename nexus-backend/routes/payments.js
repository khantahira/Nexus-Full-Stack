const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Secure payments via our verified JWT Gatekeeper!

// Mock Financial Ledger Ledger Cache Array
let transactionDatabase = [];

// =========================================================================
// 💰 1. PROCESS TRANSACTION (POST http://localhost:5000/api/payments/transaction)
// =========================================================================
router.post('/transaction', auth, (req, res) => {
    try {
        const { type, amount, recipientEmail } = req.body;

        // 1. Core Parameter Validation Check
        if (!type || !amount) {
            return res.status(400).json({ status: "Error", msg: "Missing parameters (type, amount)." });
        }

        // 2. Financial Logic Validation Check (Enforcing Sandbox Constraints)
        if (!['deposit', 'withdraw', 'transfer'].includes(type)) {
            return res.status(400).json({ status: "Error", msg: "Invalid type. Must be deposit, withdraw, or transfer." });
        }

        if (amount <= 0) {
            return res.status(400).json({ status: "Error", msg: "Transaction amount must be greater than zero." });
        }

        if (type === 'transfer' && !recipientEmail) {
            return res.status(400).json({ status: "Error", msg: "Recipient email is required for secure account transfers." });
        }

        // 3. Mapping Ledger Transaction Record Object
        const newTransaction = {
            transactionId: `tx_${Date.now()}`,
            userEmail: req.user.email, // Dynamic mapping via session token
            type: type,
            amount: parseFloat(amount),
            recipientEmail: type === 'transfer' ? recipientEmail : null,
            status: "Completed", // Simulated instant clearing for sandbox testing
            timestamp: new Date().toISOString()
        };

        // Save entry straight to data stream array
        transactionDatabase.push(newTransaction);
        console.log(`💰 [Sandbox Ledger] ${type.toUpperCase()} Processed: $${amount} for ${req.user.email}`);

        return res.status(201).json({
            status: "Success",
            msg: `Transaction matching standard type '${type}' cleared successfully into database ledger!`,
            transaction: newTransaction
        });

    } catch (error) {
        console.error("❌ Ledger Execution Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error inside financial ledger stack" });
    }
});

// =========================================================================
// 📋 2. FETCH TRANSACTION HISTORY (GET http://localhost:5000/api/payments/history)
// =========================================================================
router.get('/history', auth, (req, res) => {
    try {
        // Filter ledger to compile transactions belonging specifically to the active session user
        const userHistory = transactionDatabase.filter(tx => tx.userEmail === req.user.email || tx.recipientEmail === req.user.email);
        
        console.log(`🔍 Compiling ledger logs container for user: ${req.user.email}`);
        return res.status(200).json({
            status: "Success",
            totalTransactions: userHistory.length,
            history: userHistory
        });
    } catch (error) {
        console.error("❌ History Compile Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error compiling history arrays" });
    }
});

module.exports = router;
