const mongoose = require('mongoose');
require('dotenv').config();

const resetDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas...');

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.drop();
            console.log(`Dropped collection: ${collection.collectionName}`);
        }

        console.log('✅ Database Wiped Successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error wiping database:', err);
        process.exit(1);
    }
};

resetDB();
