const Leave = require('../../models/Leave');
const User = require('../../models/User');
const Attendance = require('../../models/Attendance');

// Apply for Leave
exports.applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, type, reason } = req.body;
        const leave = new Leave({
            user: req.user.id,
            startDate,
            endDate,
            type,
            reason
        });
        await leave.save();
        res.status(201).json(leave);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get My Leaves
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Leaves (Admin)
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('user', 'name emmail').sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Leave Status
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await Leave.findById(req.params.id);

        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        leave.status = status;
        leave.adminComment = adminComment;
        await leave.save();

        // If approved, Auto-mark attendance
        if (status === 'Approved') {
            // Logic to mark attendance for each day in range
            // For hackathon, keeping it simple: just checking overlap might be needed
            // but let's assume admin handles it or we do it here.
            // Iterate days loop:
            let current = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            while (current <= end) {
                // Check if attendance exists
                const existing = await Attendance.findOne({ user: leave.user, date: current });
                if (!existing) {
                    await Attendance.create({
                        user: leave.user,
                        date: current,
                        status: 'Leave',
                        checkInTime: null,
                        checkOutTime: null
                    });
                } else {
                    existing.status = 'Leave';
                    await existing.save();
                }
                current.setDate(current.getDate() + 1);
            }
        }

        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
