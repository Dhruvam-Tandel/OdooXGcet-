const User = require('../models/User');

const generateEmployeeId = async (companyName, fullName) => {
    try {
        // 1. Company Initials (First letter of first 2 words, or first 2 letters of 1 word)
        // Default to 'CP' (Company) if missing
        let companyInitials = 'CP';
        if (companyName) {
            const companyParts = companyName.split(' ').filter(p => p.length > 0);
            if (companyParts.length >= 2) {
                companyInitials = (companyParts[0][0] + companyParts[1][0]).toUpperCase();
            } else if (companyParts.length === 1) {
                companyInitials = companyParts[0].substring(0, 2).toUpperCase();
            }
        }

        // 2. Name Initials (First 2 chars of First Name + First 2 chars of Last Name)
        // Split by space
        let nameInitials = 'EMPL';
        if (fullName) {
            const nameParts = fullName.split(' ').filter(p => p.length > 0);
            if (nameParts.length >= 2) {
                const first = nameParts[0].substring(0, 2).toUpperCase();
                const last = nameParts[nameParts.length - 1].substring(0, 2).toUpperCase();
                nameInitials = first + last;
            } else if (nameParts.length === 1) {
                nameInitials = nameParts[0].substring(0, 4).toUpperCase().padEnd(4, 'X');
            }
        }

        // 3. Year
        const year = new Date().getFullYear();

        // 4. Serial Number
        // Find existing users with this prefix pattern to determine the next serial
        // Prefix pattern: OI-JODO-2025-XXXX
        // We need to count ALL users for this COMPANY in this YEAR to be safe? 
        // Or global serial for the company? 
        // Let's do Global Serial for the Company for simplicity and uniqueness: [COMP][YEAR][SERIAL] might be better?
        // User requested: [Company][Name][Year][Serial]

        // Let's search for IDs starting with these initials for this year to obey standard
        // Actually, "Serial Number of Joining for that Year" implies we count how many joined that year.

        // Regex to find similar IDs: ^COMP...YEAR
        // Actually, usually serial is per-company-per-year.
        // Let's simply count users with same CompanyInitials + Year to generate serial.
        // But the NameInitials part makes every prefix unique per person, so serial would always be 0001?
        // Ah, the user diagram says: "Serial Number of Joining for that Year".
        // This usually implies a global counter for the company for that year.
        // Example: OIJODO20220001 -> John Doe was the 1st hire of 2022 for Odoo India.

        // So we need to count how many users joined `companyName` in `year`.
        // We can approximate by regexing the ID? Or simpler, just query DB.

        // To keep it performant, let's look for IDs starting with CompInitials + ... + Year
        // But NameInitials changes. 

        // Strategy: Find all users whose employeeId starts with `companyInitials` and contains `year`.
        const regex = new RegExp(`^${companyInitials}.*${year}\\d{4}$`);
        const count = await User.countDocuments({ employeeId: { $regex: regex } });

        const serial = (count + 1).toString().padStart(4, '0');

        return `${companyInitials}${nameInitials}${year}${serial}`;

    } catch (err) {
        console.error('ID Generation Error', err);
        // Fallback
        return `EMP${Date.now()}`;
    }
};

module.exports = { generateEmployeeId };
