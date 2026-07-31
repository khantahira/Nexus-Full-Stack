const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    type: {
        type: String,
        required: true,
        enum: ['deposit', 'withdraw', 'transfer']
    },
    amount: {
        type: Number,
        required: true
    },
    recipientEmail: {
        type: String,
        lowercase: true,
        default: null
    },
    status: {
        type: String,
        default: 'Completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
