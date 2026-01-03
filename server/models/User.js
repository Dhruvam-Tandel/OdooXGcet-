const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin', 'hr'], default: 'employee' },
    department: { type: String },
    position: { type: String },
    joiningDate: { type: Date, default: Date.now },
    salaryStructure: {
        monthWage: { type: Number, default: 0 },
        yearlyWage: { type: Number, default: 0 },
        workingDaysPerWeek: { type: Number, default: 5 },
        breakTime: { type: Number, default: 1 },
        // Components
        basicSalary: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 50 } },
        hra: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 50 } },
        standardAllowance: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
        performanceBonus: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
        lta: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
        fixedAllowance: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 0 } },
        // PF
        pfEmployee: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 12 } },
        pfEmployer: { amount: { type: Number, default: 0 }, percentage: { type: Number, default: 12 } },
        // Tax
        professionalTax: { amount: { type: Number, default: 0 } }
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    mustChangePassword: { type: Boolean, default: false }, // For auto-generated passwords
    // Profile Fields
    companyName: { type: String }, // Required for Admin/Company creation
    phone: { type: String },
    mobile: { type: String },
    profileImage: { type: String },
    manager: { type: String },
    location: { type: String },
    about: { type: String },
    hobbies: { type: String },
    skills: [{ type: String }],
    jobLove: { type: String }
}, { timestamps: true, collection: 'Auth_Users' });

module.exports = mongoose.model('User', userSchema);
