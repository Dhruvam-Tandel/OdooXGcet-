const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // e.g., "October 2023"
    year: { type: Number, required: true },
    salaryStructure: {
        basic: Number,
        hra: Number,
        allowances: Number,
        deductions: Number
    },
    netSalary: Number,
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Paid' }
}, { timestamps: true, collection: 'HR_Payrolls' });

module.exports = mongoose.model('Payroll', payrollSchema);
