const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Correct import

// Temporary in-memory storage (later we will replace with MongoDB)
let meetingDatabase = [];

// =========================================================================
// 1. SCHEDULE A NEW MEETING
// POST /api/meetings/schedule
// =========================================================================
router.post('/schedule', protect, (req, res) => {
    try {
        const { title, date, time, inviteeId } = req.body;

        // Validation
        if (!title || !date || !time || !inviteeId) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Please fill in all required fields (title, date, time, inviteeId)." 
            });
        }

        // Simple conflict check
        const isConflict = meetingDatabase.some(
            meeting => meeting.date === date && meeting.time === time
        );

        if (isConflict) {
            return res.status(409).json({
                status: "Conflict",
                msg: "This time slot is already booked."
            });
        }

        const newMeeting = {
            id: `meet_${Date.now()}`,
            title,
            date,
            time,
            scheduledBy: req.user.id,
            inviteeId,
            status: "Pending",
            createdAt: new Date()
        };

        meetingDatabase.push(newMeeting);

        return res.status(201).json({
            status: "Success",
            msg: "Meeting scheduled successfully!",
            meeting: newMeeting
        });

    } catch (error) {
        console.error("Scheduling Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

// =========================================================================
// 2. GET ALL MEETINGS
// GET /api/meetings
// =========================================================================
router.get('/', protect, (req, res) => {
    try {
        return res.status(200).json({
            status: "Success",
            totalMeetings: meetingDatabase.length,
            meetings: meetingDatabase
        });
    } catch (error) {
        console.error("Fetch Meetings Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

// =========================================================================
// 3. UPDATE MEETING STATUS
// PATCH /api/meetings/status/:id
// =========================================================================
router.patch('/status/:id', protect, (req, res) => {
    try {
        const meetingId = req.params.id;
        const { action } = req.body; // "Accepted" or "Rejected"

        if (!action || !['Accepted', 'Rejected'].includes(action)) {
            return res.status(400).json({ 
                status: "Error", 
                msg: "Action must be 'Accepted' or 'Rejected'." 
            });
        }

        const meeting = meetingDatabase.find(meet => meet.id === meetingId);
        
        if (!meeting) {
            return res.status(404).json({ 
                status: "Error", 
                msg: "Meeting not found." 
            });
        }

        meeting.status = action;

        return res.status(200).json({
            status: "Success",
            msg: `Meeting has been ${action.toLowerCase()}!`,
            updatedMeeting: meeting
        });

    } catch (error) {
        console.error("Status Update Error:", error);
        return res.status(500).json({ 
            status: "Error", 
            msg: "Internal Server Error" 
        });
    }
});

module.exports = router;