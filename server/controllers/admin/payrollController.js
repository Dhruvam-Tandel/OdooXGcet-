const Payroll = require('../../models/Payroll');
const User = require('../../models/User');

// Get My Payroll History
exports.getMyPayroll = async (req, res) => {
    try {
        const payrolls = await Payroll.find({ user: req.user.id }).sort({ createdAt: -1 });
        // Also return current structure from User
        const user = await User.findById(req.user.id);
        res.json({ history: payrolls, structure: user.salaryStructure });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Generate Payroll (Admin - Manual Trigger for demo)
exports.generatePayroll = async (req, res) => {
    try {
        const { userId, month, year, deductions } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { basic, hra, allowances } = user.salaryStructure;
        const totalEarnings = basic + hra + allowances;
        const totalDeductions = deductions || 0; // Tax, PF etc.
        const netSalary = totalEarnings - totalDeductions;

        const payroll = new Payroll({
            user: userId,
            month,
            year,
            salaryStructure: { ...user.salaryStructure, deductions: totalDeductions },
            netSalary,
            status: 'Paid',
            paymentDate: new Date()
        });

        await payroll.save();
        res.json(payroll);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Update Salary Structure (Admin)
exports.updateSalaryStructure = async (req, res) => {
    try {
        const { userId, structure } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.salaryStructure = structure;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}
