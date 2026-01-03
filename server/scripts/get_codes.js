const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const getCodes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});

        if (users.length === 0) {
            console.log('No users found in database.');
        } else {
            console.log('\n--- ALL USERS ---');
            for (const u of users) {
                if (!u.isVerified && !u.verificationToken) {
                    u.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
                    await u.save();
                    console.log(`[UPDATED] Generated token for ${u.email}`);
                }
                console.log(`Email: ${u.email}  |  Verified: ${u.isVerified}  |  Code: ${u.verificationToken}`);
            }
            console.log('-----------------\n');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

getCodes();
