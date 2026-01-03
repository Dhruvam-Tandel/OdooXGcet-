const Attendance = require('../../models/Attendance');

// Helper to get normalized date (midnight)
const getTodayDate = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const ActivityLog = require('../../models/ActivityLog');

// Check In
exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayDate();

        let attendance = await Attendance.findOne({ user: userId, date: today });

        if (attendance) {
            if (attendance.checkInTime) {
                return res.status(400).json({ message: 'Already checked in today' });
            }
            // If record exists but no checkIn (e.g. pre-created leave?), update it
            attendance.checkInTime = new Date();
            attendance.status = 'Present';
            await attendance.save();
        } else {
            // Create new
            attendance = new Attendance({
                user: userId,
                date: today,
                checkInTime: new Date(),
                status: 'Present'
            });
            await attendance.save();
        }

        // Keep existing Log logic if any, adding ActivityLog
        await new ActivityLog({ user: userId, action: 'CHECK_IN', details: `Checked in at ${new Date().toLocaleTimeString()}` }).save();

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Check Out
exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayDate();

        const attendance = await Attendance.findOne({ user: userId, date: today });
        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({ message: 'You have not checked in today' });
        }

        attendance.checkOutTime = new Date();

        // Calculate duration
        const diffMs = attendance.checkOutTime - attendance.checkInTime;
        const minutes = Math.floor(diffMs / 60000);
        attendance.workDuration = minutes;

        if (minutes < 240) { // Less than 4 hours
            attendance.status = 'Half-day';
        }

        await attendance.save();

        await new ActivityLog({ user: userId, action: 'CHECK_OUT', details: `Checked out at ${new Date().toLocaleTimeString()}` }).save();

        res.json(attendance);

    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get Status for Today
exports.getTodayStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = getTodayDate();
        const attendance = await Attendance.findOne({ user: userId, date: today });
        res.json(attendance || { status: 'Not Marked' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get All Attendance (for Calendar)
exports.getMyAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        // Optional: filter by month/year queries
        const records = await Attendance.find({ user: userId }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
    }
};

// Get Attendance Stats
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const records = await Attendance.find({
            user: userId,
            date: { $gte: firstDay }
        });

        // 1. Avg Check-in Time
        let totalMinutes = 0;
        let count = 0;
        records.forEach(r => {
            if (r.checkInTime) {
                const d = new Date(r.checkInTime);
                totalMinutes += d.getHours() * 60 + d.getMinutes();
                count++;
            }
        });

        let avgCheckIn = '--:--';
        if (count > 0) {
            const avgMin = totalMinutes / count;
            const h = Math.floor(avgMin / 60);
            const m = Math.floor(avgMin % 60);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            avgCheckIn = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        }

        // 2. Attendance Score (Consistency)
        // Simple logic: Present days / (Current Day of Month - Weekends approx)
        // For hackathon, let's just do: (Present Days / Days passed in month) * 100
        const daysPassed = now.getDate();
        const presentCount = records.filter(r => r.status === 'Present' || r.status === 'Half-day').length;
        const score = Math.round((presentCount / daysPassed) * 100) || 0;

        res.json({
            avgCheckIn: avgCheckIn,
            attendanceScore: score,
            presentDays: presentCount
        });


    } catch (err) {
        console.error("Error in getStats:", err);
        res.status(500).json({ message: 'Server Error' });
    }
}
// Get Heatmap Data (Activity Level for last 365 days)
exports.getHeatmapData = async (req, res) => {
    try {
        const userId = req.user.id;
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const records = await Attendance.find({
            user: userId,
            date: { $gte: oneYearAgo }
        });

        // Map to efficient object { 'YYYY-MM-DD': level }
        const heatmap = {};
        records.forEach(r => {
            const dateStr = r.date.toISOString().split('T')[0];
            let level = 0;
            if (r.status === 'Present') level = 2; // Normal
            if (r.status === 'Half-day') level = 1; // Less
            if (r.workDuration > 540) level = 3; // High (9+ hours)
            if (r.status === 'Absent') level = 0;

            // Ensure we don't overwrite a higher level with a lower one if multiple records
            if (!heatmap[dateStr] || level > heatmap[dateStr]) {
                heatmap[dateStr] = level;
            }
        });

        res.json(heatmap);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const User = require('../../models/User');
const Leave = require('../../models/Leave');

// Get All Employees with Today's Status
exports.getEmployeeStatus = async (req, res) => {
    try {
        const today = getTodayDate();

        // 1. Get all employees
        const employees = await User.find({ role: 'employee' }).select('-password');

        // 2. Get today's attendance
        const attendanceRecords = await Attendance.find({ date: today });

        // 3. Get active leaves for today
        // A leave covers today if startDate <= today <= endDate
        // AND status is Approved
        const activeLeaves = await Leave.find({
            status: 'Approved',
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        // 4. Map status
        const employeeData = employees.map(emp => {
            let status = 'Absent'; // Default

            // Check Leave
            const isOnLeave = activeLeaves.find(l => l.user.toString() === emp._id.toString());
            if (isOnLeave) {
                status = 'On Leave';
            } else {
                // Check Attendance
                const attendance = attendanceRecords.find(a => a.user.toString() === emp._id.toString());
                if (attendance && attendance.checkInTime) {
                    status = 'Present';
                }
            }

            return {
                _id: emp._id,
                name: emp.name,
                email: emp.email,
                role: emp.role,
                department: emp.department,
                position: emp.position,
                status // 'Present', 'On Leave', 'Absent'
            };
        });

        res.json(employeeData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
