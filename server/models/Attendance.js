const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: { type: String, enum: ['Present', 'Absent', 'Half-day'], default: 'Absent' },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    workDuration: { type: Number, default: 0 } // in minutes
}, { timestamps: true, collection: 'Emp_Attendance' });

// Compound index to ensure one record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
