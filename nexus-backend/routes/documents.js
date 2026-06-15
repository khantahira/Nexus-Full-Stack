const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Secure data guard gatekeeper

// Mock Database Array to simulate document uploads, versioning, and status metrics
let documentDatabase = [];

// =========================================================================
// 📂 1. REGISTER AN UPLOADED DOCUMENT (POST http://localhost:5000/api/documents/upload)
// =========================================================================
router.post('/upload', auth, (req, res) => {
    try {
        const { fileName, fileUrl, fileSize } = req.body;

        if (!fileName || !fileUrl) {
            return res.status(400).json({ status: "Error", msg: "Missing core file metadata parameters." });
        }

        // Creating dynamic record schema item matching database constraints
        const newDocument = {
            id: `doc_${Date.now()}`,
            fileName,
            fileUrl, // Points to target cloud storage container location
            fileSize: fileSize || "Unknown size",
            uploadedBy: req.user.email, // Read identity directly from JWT block
            status: "Pending Signature", // Workflow state tracker variable
            signatureImage: null, // Initial placeholder value
            signedAt: null,
            version: "v1.0"
        };

        documentDatabase.push(newDocument);
        console.log(`📂 Document Registered: "${fileName}" uploaded by ${req.user.email}`);

        return res.status(201).json({
            status: "Success",
            msg: "Asset cataloged successfully inside document tracking layers!",
            document: newDocument
        });

    } catch (error) {
        console.error("❌ Document Upload Route Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error mapping file payload" });
    }
});

// =========================================================================
// 📋 2. FETCH ALL ACTIVE RECORD METRICS (GET http://localhost:5000/api/documents)
// =========================================================================
router.get('/', auth, (req, res) => {
    try {
        // Filters documents down so users only query files relative to their profiles
        const userFiles = documentDatabase.filter(doc => doc.uploadedBy === req.user.email);
        
        return res.status(200).json({
            status: "Success",
            totalDocuments: userFiles.length,
            documents: userFiles
        });
    } catch (error) {
        console.error("❌ Fetch Documents Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error retrieving file metadata" });
    }
});

// =========================================================================
// ✍️ 3. CRYPTOGRAPHIC E-SIGNATURE INJECTION (PATCH http://localhost:5000/api/documents/sign/:id)
// =========================================================================
router.patch('/sign/:id', auth, (req, res) => {
    try {
        const docId = req.params.id;
        const { signatureDataUri } = req.body; // Expects incoming base64 drawing canvas strings

        if (!signatureDataUri) {
            return res.status(400).json({ status: "Error", msg: "Cryptographic signing matrix requires base64 canvas stream." });
        }

        // Search object mapping targets inside simulation thread arrays
        const document = documentDatabase.find(doc => doc.id === docId);

        if (!document) {
            return res.status(404).json({ status: "Error", msg: "Target document tracking asset row not found." });
        }

        // Atomic variable mutation transformations updates state permanently
        document.signatureImage = signatureDataUri;
        document.status = "Signed & Verified";
        document.signedAt = new Date().toISOString();

        console.log(`✍️ Document ${docId} sealed with valid digital signature vector by ${req.user.email}`);

        return res.status(200).json({
            status: "Success",
            msg: "Dynamic e-signature securely bound onto document profile!",
            updatedDocument: document
        });

    } catch (error) {
        console.error("❌ E-Sign Ingestion Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error executing signature merge arrays" });
    }
});

module.exports = router;
