const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Correct import

// Temporary in-memory storage
let documentDatabase = [];

// =========================================================================
// 1. UPLOAD DOCUMENT
// POST /api/documents/upload
// =========================================================================
router.post('/upload', protect, (req, res) => {
    try {
        const { fileName, fileUrl, fileSize } = req.body;

        if (!fileName || !fileUrl) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "fileName and fileUrl are required." 
            });
        }

        const newDocument = {
            id: `doc_${Date.now()}`,
            fileName,
            fileUrl,
            fileSize: fileSize || "Unknown",
            uploadedBy: req.user.id,
            status: "Pending Signature",
            signatureImage: null,
            signedAt: null,
            version: "v1.0",
            createdAt: new Date()
        };

        documentDatabase.push(newDocument);

        return res.status(201).json({
            status: "Success",
            msg: "Document uploaded successfully!",
            document: newDocument
        });

    } catch (error) {
        console.error("Document Upload Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

// =========================================================================
// 2. GET ALL DOCUMENTS
// GET /api/documents
// =========================================================================
router.get('/', protect, (req, res) => {
    try {
        const userFiles = documentDatabase.filter(
            doc => doc.uploadedBy === req.user.id
        );
        
        return res.status(200).json({
            status: "Success",
            totalDocuments: userFiles.length,
            documents: userFiles
        });
    } catch (error) {
        console.error("Fetch Documents Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

// =========================================================================
// 3. SIGN DOCUMENT
// PATCH /api/documents/sign/:id
// =========================================================================
router.patch('/sign/:id', protect, (req, res) => {
    try {
        const docId = req.params.id;
        const { signatureDataUri } = req.body;

        if (!signatureDataUri) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "signatureDataUri is required." 
            });
        }

        const document = documentDatabase.find(doc => doc.id === docId);

        if (!document) {
            return res.status(404).json({ 
                status: "Error", 
                msg: "Document not found." 
            });
        }

        document.signatureImage = signatureDataUri;
        document.status = "Signed & Verified";
        document.signedAt = new Date().toISOString();

        return res.status(200).json({
            status: "Success",
            msg: "Document signed successfully!",
            updatedDocument: document
        });

    } catch (error) {
        console.error("Sign Document Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

module.exports = router;
