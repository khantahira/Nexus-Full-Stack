const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Protects meeting channels with our JWT Gatekeeper!

// Mock DB Cache Array to hold meeting slots for scheduling and conflict checking
let meetingDatabase = [];

// =========================================================================
// 📅 1. SCHEDULE A NEW MEETING (POST http://localhost:5000/api/meetings/schedule)
// =========================================================================
router.post('/schedule', auth, (req, res) => {
    try {
        const { title, date, time, hostId, inviteeId } = req.body;

        // Validation Check
        if (!title || !date || !time || !inviteeId) {
            return res.status(400).json({ status: "Error", msg: "Please fill in all core meeting parameters." });
        }

        // Conflict Detection Algorithm Simulation (Milestone 3 Requirement!)
        const isConflict = meetingDatabase.some(meeting => meeting.date === date && meeting.time === time);
        if (isConflict) {
            return res.status(409).json({
                status: "Conflict",
                msg: "Scheduling collision detected! This specific calendar time slot is already booked."
            });
        }

        // Object mapping for database entry
        const newMeeting = {
            id: `meet_${Date.now()}`,
            title,
            date,
            time,
            scheduledBy: req.user.email, // Automatically reading active session email from token
            inviteeId,
            status: "Pending" // Initial state matching workflow criteria
        };

        // Save entry into simulation threads
        meetingDatabase.push(newMeeting);
        console.log(`📅 New Meeting Scheduled: "${title}" on ${date} @ ${time}`);

        return res.status(201).json({
            status: "Success",
            msg: "Meeting slot reserved and notification transmitted!",
            meeting: newMeeting
        });

    } catch (error) {
        console.error("❌ Scheduling Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during scheduling workflow" });
    }
});

// =========================================================================
// 📋 2. FETCH ALL ACTIVE MEETINGS (GET http://localhost:5000/api/meetings)
// =========================================================================
router.get('/', auth, (req, res) => {
    try {
        console.log(`🔍 Compiling calendar entries stream for: ${req.user.email}`);
        return res.status(200).json({
            status: "Success",
            totalMeetings: meetingDatabase.length,
            meetings: meetingDatabase
        });
    } catch (error) {
        console.error("❌ Fetch Meetings Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during data compile" });
    }
});
// =========================================================================
// 🔄 3. UPDATE MEETING STATUS (PATCH http://localhost:5000/api/meetings/status/:id)
// =========================================================================
router.patch('/status/:id', auth, (req, res) => {
    try {
        const meetingId = req.params.id;
        const { action } = req.body; // Action can be "Accepted" or "Rejected"

        // 1. Validate Input Action
        if (!action || !['Accepted', 'Rejected'].includes(action)) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Invalid action parameter. Must be 'Accepted' or 'Rejected'." 
            });
        }

        // 2. Find Meeting Entry in Database
        const meeting = meetingDatabase.find(meet => meet.id === meetingId);
        
        if (!meeting) {
            return res.status(404).json({ 
                status: "Error", 
                msg: "Meeting target record not found." 
            });
        }

        // 3. Update Status State Permanently
        meeting.status = action;
        console.log(`🔄 Meeting ${meetingId} status updated to: ${action} by ${req.user.email}`);

        return res.status(200).json({
            status: "Success",
            msg: `Meeting invitation has been successfully ${action.toLowerCase()}!`,
            updatedMeeting: meeting
        });

    } catch (error) {
        console.error("❌ Status Update Error:", error);
        return res.status(500).json({ status: "Error", msg: "Internal Server Error during workflow state modification" });
    }
});

module.exports = router;
