const User = require('../../models/User');
const ActivityLog = require('../../models/ActivityLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, companyName } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Password Security Rules
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include a number and a special character.' });
        }

        // Generate Custom Employee ID
        const { generateEmployeeId } = require('../../utils/idGenerator');
        // If it's a new company registration, user provided companyName
        const finalCompanyName = companyName || 'Dayflow Inc';
        const employeeId = await generateEmployeeId(finalCompanyName, name);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Verification Token
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user (Admin/HR usually registers first)
        const newUser = new User({
            name,
            employeeId,
            email,
            phone,
            companyName: finalCompanyName,
            password: hashedPassword,
            role: 'admin', // First user is Admin
            isVerified: false,
            verificationToken
        });

        await newUser.save();

        // Send Email
        const { sendVerificationEmail } = require('../../utils/emailService');
        const emailSent = await sendVerificationEmail(email, verificationToken);

        // Also simpler response
        res.status(201).json({
            message: 'Company registered successfully! Please check email for verification code.',
            email,
            employeeId // Return ID so they can see it
        });

    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
        if (user.verificationToken !== code) return res.status(400).json({ message: 'Invalid verification code' });

        user.isVerified = true;
        user.verificationToken = undefined; // Clear token after success
        await user.save();

        res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Email Verification Check
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Create Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Log Activity
        try {
            await ActivityLog.create({
                user: user._id,
                action: 'LOGIN',
                details: 'User logged in successfully',
                ip: req.ip
            });
        } catch (logErr) {
            console.error('Failed to log activity:', logErr);
            // Don't fail the login if logging fails
        }

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mustChangePassword: user.mustChangePassword
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Current User (Private)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// Create Employee (Admin Only)
exports.createEmployee = async (req, res) => {
    try {
        const { name, email, role, department, position, phone } = req.body;
        const adminUser = await User.findById(req.user.id);

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

        // Generate Custom Employee ID
        const { generateEmployeeId } = require('../../utils/idGenerator');
        const employeeId = await generateEmployeeId(adminUser.companyName, name);

        // Auto-generate Password
        // Simple random string
        const generatedPassword = Math.random().toString(36).slice(-8) + "!1Aa";

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        // Create user
        const newUser = new User({
            name,
            employeeId,
            email,
            phone,
            password: hashedPassword,
            role: role || 'employee',
            companyName: adminUser.companyName,
            department,
            position,
            manager: adminUser.name, // Assigned to creator initially
            isVerified: true, // Admin created users are verified by default
            mustChangePassword: true // Force password change on first login
        });

        await newUser.save();

        // Send Welcome Email with Credentials
        // reused/modified email service needed or just plain mailer logic here?
        // Let's use clean separate logic or import transporter
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Dayflow HRMS" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Dayflow - Your Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #4F46E5;">Welcome to ${adminUser.companyName}!</h2>
                    <p>Your employee account has been created.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <p><strong>Login Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> ${generatedPassword}</p>
                    </div>
                    <p>Please login with these credentials. You will be asked to change your password immediately.</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Employee created and credentials sent to email.', employeeId });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Change Password (First Login)
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Password Security Rules
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include a number and a special character.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password updated successfully. You are now fully logged in.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const {
            mobile, location, about, hobbies, skills, jobLove,
            dateOfBirth, address, nationality, personalEmail, gender, maritalStatus, dateOfJoining,
            bankAccountNumber, bankName, ifscCode, panNumber, uanNumber
        } = req.body;

        // Find user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields
        if (mobile) user.mobile = mobile;
        if (location) user.location = location;
        if (about) user.about = about;
        if (hobbies) user.hobbies = hobbies;
        if (skills) user.skills = skills; // Ensure skills is parsed if sent as JSON string
        if (jobLove) user.jobLove = jobLove;

        // Profile Image
        if (req.file) {
            user.profileImage = `/uploads/${req.file.filename}`;
        }

        // Handle Skills (can be array or single string from Multer)
        if (skills) {
            user.skills = Array.isArray(skills) ? skills : [skills];
        }

        // Handle Salary Structure
        if (req.body.salaryStructure) {
            try {
                let salaryData = req.body.salaryStructure;
                if (typeof salaryData === 'string') {
                    salaryData = JSON.parse(salaryData);
                }
                // Merge with existing structure
                user.salaryStructure = {
                    ...user.salaryStructure,
                    ...salaryData
                };
            } catch (e) {
                console.error("Error parsing salary structure:", e);
            }
        }

        // Private Info Updates (Check for empty strings to prevent Date CastError)
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (address) user.address = address;
        if (nationality) user.nationality = nationality;
        if (personalEmail) user.personalEmail = personalEmail;
        if (gender) user.gender = gender;
        if (maritalStatus) user.maritalStatus = maritalStatus;
        if (dateOfJoining) user.dateOfJoining = dateOfJoining;

        // Bank Details Updates
        if (bankAccountNumber) user.bankAccountNumber = bankAccountNumber;
        if (bankName) user.bankName = bankName;
        if (ifscCode) user.ifscCode = ifscCode;
        if (panNumber) user.panNumber = panNumber;
        if (uanNumber) user.uanNumber = uanNumber;

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'employee' }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
}
