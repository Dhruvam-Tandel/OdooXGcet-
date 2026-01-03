const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'LOGOUT', 'CHECK_IN'
    details: { type: String }, // Optional details
    ip: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { collection: 'Sys_Logs' });

module.exports = mongoose.model('ActivityLog', activitySchema);
