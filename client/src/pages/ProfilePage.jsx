import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Briefcase, Building, Save, Edit2, Plus, X, ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate(); // Add hook
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('private'); // 'resume', 'private', 'salary'

    const handleBack = () => {
        if (user?.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/dashboard');
        }
    };

    const [formData, setFormData] = useState({
        mobile: '',
        location: '',
        manager: '',
        about: '',
        jobLove: '',
        hobbies: '',
        skills: [],
        profileImage: '', // URL from DB
        profileImageFile: null, // File to upload
        profileImagePreview: null, // Preview
        // Private Info
        dateOfBirth: '',
        address: '',
        nationality: '',
        personalEmail: '',
        gender: '',
        maritalStatus: '',
        dateOfJoining: '',
        // Bank Info
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        panNumber: '',
        uanNumber: '',
        // Salary Info
        salaryStructure: {
            monthWage: 0,
            yearlyWage: 0,
            workingDaysPerWeek: 5,
            breakTime: 1,
            basicSalary: { amount: 0, percentage: 50 },
            hra: { amount: 0, percentage: 50 },
            standardAllowance: { amount: 0, percentage: 0 },
            performanceBonus: { amount: 0, percentage: 0 },
            lta: { amount: 0, percentage: 0 },
            fixedAllowance: { amount: 0, percentage: 0 },
            pfEmployee: { amount: 0, percentage: 12 },
            pfEmployer: { amount: 0, percentage: 12 },
            professionalTax: { amount: 0 }
        }
    });
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;

            // Auto-populate Date of Joining from createdAt if available and empty
            const joinedDate = data.dateOfJoining
                ? data.dateOfJoining.split('T')[0]
                : (data.createdAt ? data.createdAt.split('T')[0] : '');

            setFormData({
                mobile: data.mobile || '',
                location: data.location || '',
                manager: data.manager || '',
                about: data.about || '',
                jobLove: data.jobLove || '',
                hobbies: data.hobbies || '',
                skills: data.skills || [],
                profileImage: data.profileImage || '',
                profileImageFile: null,
                profileImagePreview: null,
                // Private Info
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                address: data.address || '',
                nationality: data.nationality || '',
                personalEmail: data.personalEmail || '',
                gender: data.gender || '',
                maritalStatus: data.maritalStatus || '',
                dateOfJoining: joinedDate,

                // Bank Info
                bankAccountNumber: data.bankAccountNumber || '',
                bankName: data.bankName || '',
                ifscCode: data.ifscCode || '',
                panNumber: data.panNumber || '',
                uanNumber: data.uanNumber || '',
                // Salary Info
                salaryStructure: data.salaryStructure || {
                    monthWage: 0,
                    yearlyWage: 0,
                    workingDaysPerWeek: 5,
                    breakTime: 1,
                    basicSalary: { amount: 0, percentage: 50 },
                    hra: { amount: 0, percentage: 50 },
                    standardAllowance: { amount: 0, percentage: 0 },
                    performanceBonus: { amount: 0, percentage: 0 },
                    lta: { amount: 0, percentage: 0 },
                    fixedAllowance: { amount: 0, percentage: 0 },
                    pfEmployee: { amount: 0, percentage: 12 },
                    pfEmployer: { amount: 0, percentage: 12 },
                    professionalTax: { amount: 0 }
                }
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Calculation Logic
    const calculateSalaryStructure = (currentStructure, fieldChanged, newValue) => {
        let structure = { ...currentStructure };

        // Update the field that changed
        if (fieldChanged.includes('.')) {
            const [parent, child] = fieldChanged.split('.');
            if (structure[parent]) {
                structure[parent] = { ...structure[parent], [child]: parseFloat(newValue) || 0 };
            }
        } else {
            structure[fieldChanged] = parseFloat(newValue) || 0;
        }

        const wage = structure.monthWage;

        // Auto-calculate components based on rules
        // 1. Basic = % of Wage (Default 50%)
        structure.basicSalary.amount = Math.round(wage * (structure.basicSalary.percentage / 100));

        // 2. HRA = % of Basic (Default 50%)
        structure.hra.amount = Math.round(structure.basicSalary.amount * (structure.hra.percentage / 100));

        // 3. Performance Bonus = % of Basic
        structure.performanceBonus.amount = Math.round(structure.basicSalary.amount * (structure.performanceBonus.percentage / 100));

        // 4. LTA = % of Basic
        structure.lta.amount = Math.round(structure.basicSalary.amount * (structure.lta.percentage / 100));

        // 5. Standard Allowance (Fixed value usually, but let's keep it manual or user input)
        // No auto-calc for standard allowance amount unless we want to enforce it. keeping as is.

        // 6. Fixed Allowance = Wage - (Sum of all others)
        const totalAllocated =
            structure.basicSalary.amount +
            structure.hra.amount +
            structure.performanceBonus.amount +
            structure.lta.amount +
            structure.standardAllowance.amount;

        structure.fixedAllowance.amount = Math.max(0, wage - totalAllocated);

        // 7. PF = % of Basic
        structure.pfEmployee.amount = Math.round(structure.basicSalary.amount * (structure.pfEmployee.percentage / 100));
        structure.pfEmployer.amount = Math.round(structure.basicSalary.amount * (structure.pfEmployer.percentage / 100));

        // 8. Yearly Wage
        structure.yearlyWage = wage * 12;

        return structure;
    };

    const handleSalaryChange = (field, value) => {
        const newStructure = calculateSalaryStructure(formData.salaryStructure, field, value);
        setFormData({ ...formData, salaryStructure: newStructure });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImageFile: file, profileImagePreview: URL.createObjectURL(file) });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();

            // Append all text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'profileImageFile' && key !== 'profileImagePreview' && key !== 'skills' && key !== 'salaryStructure') {
                    data.append(key, formData[key]);
                }
            });

            // Append Salary Structure as JSON string
            data.append('salaryStructure', JSON.stringify(formData.salaryStructure));

            // Append skills as JSON string (or array loop depending on backend parser, Express body-parser handles basic arrays but FormData is cleaner as string or repeated keys)
            // Let's loop for array
            formData.skills.forEach(skill => data.append('skills', skill));

            // Append Image
            if (formData.profileImageFile) {
                data.append('profileImage', formData.profileImageFile);
            }

            const res = await axios.put('http://localhost:5000/api/auth/profile', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update local user context if needed or just refetch
            // If backend returns updated user with image URL
            if (res.data.user.profileImage) {
                // Force context update or just local state? 
                // Context update is better but might require a dedicated context method. 
                // For now, let's rely on fetchProfile or re-login. 
                // Actually fetchProfile will run on mount, let's update local display
            }

            setIsEditing(false);
            fetchProfile(); // Refetch to get clean state

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addSkill = () => {
        if (newSkill && !formData.skills.includes(newSkill)) {
            setFormData({ ...formData, skills: [...formData.skills, newSkill] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
            >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
            </button>

            {/* Header Card */}
            <div className="bg-surface/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500"></div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    {/* Left: Avatar & Basic Info */}
                    <div className="flex flex-col items-center md:items-start gap-4 min-w-[250px]">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-slate-700 shadow-xl flex items-center justify-center relative group overflow-hidden">
                            {/* Avatar Display */}
                            {formData.profileImagePreview ? (
                                <img src={formData.profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : formData.profileImage ? (
                                <img src={`http://localhost:5000${formData.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-400">{user?.name?.charAt(0)}</span>
                            )}

                            {/* Upload Overlay */}
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <Edit2 size={24} className="text-white" />
                                </label>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white font-hand">{user?.name}</h1>
                            <p className="text-slate-400 text-lg">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</p>
                            <p className="text-sky-400 text-sm mt-1">{user?.email}</p>
                        </div>
                    </div>

                    {/* Right: Detailed Fields Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="space-y-4">
                            <InputField label="Company" value="Dayflow Inc." readOnly icon={Building} />
                            <InputField
                                label="Department"
                                value={user?.department || 'Engineering'}
                                readOnly
                                icon={Briefcase}
                            />
                        </div>
                        <div className="space-y-4">
                            <InputField
                                label="Manager"
                                value={formData.manager}
                                onChange={(val) => setFormData({ ...formData, manager: val })}
                                isEditing={isEditing}
                                placeholder="Your Manager"
                                icon={User}
                            />
                            <InputField
                                label="Location"
                                value={formData.location}
                                onChange={(val) => setFormData({ ...formData, location: val })}
                                isEditing={isEditing}
                                placeholder="City, Country"
                                icon={MapPin}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <InputField
                                label="Mobile"
                                value={formData.mobile}
                                onChange={(val) => setFormData({ ...formData, mobile: val })}
                                isEditing={isEditing}
                                placeholder="+1 234 567 890"
                                icon={Phone}
                            />
                        </div>
                    </div>

                    {/* Edit Actions */}
                    <div className="absolute top-0 right-0">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-slate-600"
                            >
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-6 mt-12 border-b border-slate-700">
                    {['Resume', 'Private Info', user?.role === 'admin' && 'Salary Info'].filter(Boolean).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === tab.toLowerCase().split(' ')[0]
                                ? 'text-sky-400'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase().split(' ')[0] && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Sections */}
            {activeTab === 'resume' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: About & Job Love */}
                    <div className="space-y-6">
                        <SectionBox title="About Me">
                            <TextArea
                                value={formData.about}
                                onChange={(val) => setFormData({ ...formData, about: val })}
                                isEditing={isEditing}
                                placeholder="Tell us a bit about yourself..."
                            />
                        </SectionBox>

                        <SectionBox title="What I love about my job">
                            <TextArea
                                value={formData.jobLove}
                                onChange={(val) => setFormData({ ...formData, jobLove: val })}
                                isEditing={isEditing}
                                placeholder="What drives you?"
                            />
                        </SectionBox>
                        <SectionBox title="Interests and Hobbies">
                            <TextArea
                                value={formData.hobbies}
                                onChange={(val) => setFormData({ ...formData, hobbies: val })}
                                isEditing={isEditing}
                                placeholder="Gaming, Hiking, Coding..."
                            />
                        </SectionBox>
                    </div>

                    {/* Right Column: Skills & Info */}
                    <div className="space-y-6">
                        <SectionBox title="Skills">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {formData.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm flex items-center gap-2">
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)} className="hover:text-white"><X size={14} /></button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-sky-500 outline-none flex-1"
                                        placeholder="Add a new skill..."
                                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                    />
                                    <button onClick={addSkill} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            )}
                            {!isEditing && formData.skills.length === 0 && (
                                <p className="text-slate-500 text-sm italic">No skills added yet.</p>
                            )}
                        </SectionBox>
                    </div>
                </div>
            )}

            {activeTab === 'private' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Details */}
                    <SectionBox title="Personal Details">
                        <div className="space-y-4">
                            <InputField label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(val) => setFormData({ ...formData, dateOfBirth: val })} isEditing={isEditing} />
                            <InputField label="Residing Address" value={formData.address} onChange={(val) => setFormData({ ...formData, address: val })} isEditing={isEditing} />
                            <InputField label="Nationality" value={formData.nationality} onChange={(val) => setFormData({ ...formData, nationality: val })} isEditing={isEditing} />
                            <InputField label="Personal Email" value={formData.personalEmail} onChange={(val) => setFormData({ ...formData, personalEmail: val })} isEditing={isEditing} />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectDropdown
                                    label="Gender"
                                    value={formData.gender}
                                    onChange={(val) => setFormData({ ...formData, gender: val })}
                                    options={['Male', 'Female', 'Other', 'Prefer not to say']}
                                    isEditing={isEditing}
                                />
                                <SelectDropdown
                                    label="Marital Status"
                                    value={formData.maritalStatus}
                                    onChange={(val) => setFormData({ ...formData, maritalStatus: val })}
                                    options={['Single', 'Married', 'Divorced', 'Widowed']}
                                    isEditing={isEditing}
                                />
                            </div>
                            <InputField label="Date of Joining" type="date" value={formData.dateOfJoining} onChange={(val) => setFormData({ ...formData, dateOfJoining: val })} isEditing={isEditing} />
                        </div>
                    </SectionBox>

                    {/* Bank & System Details */}
                    <SectionBox title="Bank & System Details">
                        <div className="space-y-4">
                            <InputField label="Account Number" value={formData.bankAccountNumber} onChange={(val) => setFormData({ ...formData, bankAccountNumber: val })} isEditing={isEditing} />
                            <InputField label="Bank Name" value={formData.bankName} onChange={(val) => setFormData({ ...formData, bankName: val })} isEditing={isEditing} />
                            <InputField label="IFSC Code" value={formData.ifscCode} onChange={(val) => setFormData({ ...formData, ifscCode: val })} isEditing={isEditing} />
                            <InputField label="PAN Number" value={formData.panNumber} onChange={(val) => setFormData({ ...formData, panNumber: val })} isEditing={isEditing} />
                            <InputField label="UAN Number" value={formData.uanNumber} onChange={(val) => setFormData({ ...formData, uanNumber: val })} isEditing={isEditing} />
                            <InputField label="Employee Code" value={user?.employeeId} readOnly={true} isEditing={true} />
                        </div>
                    </SectionBox>
                </div>
            )}

            {activeTab === 'salary' && user?.role === 'admin' && (
                <div className="grid grid-cols-1 gap-6">
                    <SectionBox title="Salary Overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            <div className="flex items-center gap-4">
                                <InputField
                                    label="Monthly Wage"
                                    value={formData.salaryStructure.monthWage}
                                    onChange={(val) => handleSalaryChange('monthWage', val)}
                                    isEditing={isEditing}
                                    type="number"
                                />
                                <span className="pt-6 text-slate-400">/ Month</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <InputField
                                    label="Yearly Wage"
                                    value={formData.salaryStructure.yearlyWage}
                                    onChange={(val) => setFormData({
                                        ...formData,
                                        salaryStructure: { ...formData.salaryStructure, yearlyWage: val }
                                    })}
                                    isEditing={isEditing}
                                    type="number"
                                />
                                <span className="pt-6 text-slate-400">/ Yearly</span>
                            </div>
                            <InputField
                                label="Working Days / Week"
                                value={formData.salaryStructure.workingDaysPerWeek}
                                onChange={(val) => setFormData({
                                    ...formData,
                                    salaryStructure: { ...formData.salaryStructure, workingDaysPerWeek: val }
                                })}
                                isEditing={isEditing}
                                type="number"
                            />
                            <div className="flex items-center gap-4">
                                <InputField
                                    label="Break Time (Hrs)"
                                    value={formData.salaryStructure.breakTime}
                                    onChange={(val) => setFormData({
                                        ...formData,
                                        salaryStructure: { ...formData.salaryStructure, breakTime: val }
                                    })}
                                    isEditing={isEditing}
                                    type="number"
                                />
                            </div>
                        </div>
                    </SectionBox>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SectionBox title="Salary Components">
                            <div className="space-y-6">
                                {/* Helper to render Salary Row */}
                                <SalaryRow
                                    label="Basic Salary"
                                    keys={['basicSalary']}
                                    data={formData.salaryStructure.basicSalary}
                                    onChange={(field, val) => handleSalaryChange(`basicSalary.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext={`Defined as ${formData.salaryStructure.basicSalary.percentage}% of monthly wages`}
                                />
                                <SalaryRow
                                    label="House Rent Allowance"
                                    keys={['hra']}
                                    data={formData.salaryStructure.hra}
                                    onChange={(field, val) => handleSalaryChange(`hra.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext={`Defined as ${formData.salaryStructure.hra.percentage}% of Basic Salary`}
                                />
                                <SalaryRow
                                    label="Standard Allowance"
                                    keys={['standardAllowance']}
                                    data={formData.salaryStructure.standardAllowance}
                                    onChange={(field, val) => handleSalaryChange(`standardAllowance.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext="Fixed Amount"
                                />
                                <SalaryRow
                                    label="Performance Bonus"
                                    keys={['performanceBonus']}
                                    data={formData.salaryStructure.performanceBonus}
                                    onChange={(field, val) => handleSalaryChange(`performanceBonus.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext={`${formData.salaryStructure.performanceBonus.percentage}% of Basic Salary`}
                                />
                                <SalaryRow
                                    label="Leave Travel Allowance"
                                    keys={['lta']}
                                    data={formData.salaryStructure.lta}
                                    onChange={(field, val) => handleSalaryChange(`lta.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext={`${formData.salaryStructure.lta.percentage}% of Basic Salary`}
                                />
                                <SalaryRow
                                    label="Fixed Allowance"
                                    keys={['fixedAllowance']}
                                    data={formData.salaryStructure.fixedAllowance}
                                    onChange={(field, val) => handleSalaryChange(`fixedAllowance.${field}`, val)}
                                    isEditing={isEditing}
                                    subtext="Balancing Component (Wage - Total Allo.)"
                                />
                            </div>
                        </SectionBox>

                        <div className="space-y-6">
                            <SectionBox title="Provident Fund (PF)">
                                <div className="space-y-6">
                                    <SalaryRow
                                        label="PF (Employee)"
                                        keys={['pfEmployee']}
                                        data={formData.salaryStructure.pfEmployee}
                                        onChange={(field, val) => handleSalaryChange(`pfEmployee.${field}`, val)}
                                        isEditing={isEditing}
                                        subtext="12% of Basic"
                                    />
                                    <SalaryRow
                                        label="PF (Employer)"
                                        keys={['pfEmployer']}
                                        data={formData.salaryStructure.pfEmployer}
                                        onChange={(field, val) => handleSalaryChange(`pfEmployer.${field}`, val)}
                                        isEditing={isEditing}
                                        subtext="12% of Basic"
                                    />
                                </div>
                            </SectionBox>

                            <SectionBox title="Tax Deductions">
                                <div className="flex items-center justify-between gap-4">
                                    <label className="text-sm text-slate-300 w-1/3">Professional Tax</label>
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="number"
                                            value={formData.salaryStructure.professionalTax.amount}
                                            onChange={(e) => handleSalaryChange('professionalTax.amount', e.target.value)}
                                            readOnly={!isEditing}
                                            className="bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-right flex-1 text-slate-200 focus:outline-none"
                                        />
                                        <span className="text-slate-500 text-xs">/month</span>
                                    </div>
                                </div>
                            </SectionBox>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable Components

const SectionBox = ({ title, children }) => (
    <div className="bg-surface/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

const InputField = ({ label, value, onChange, isEditing, readOnly, placeholder, icon: Icon, type = 'text' }) => (
    <div className="relative group">
        <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider">{label}</label>
        <div className="relative">
            {Icon && <Icon size={16} className="absolute left-3 top-3 text-slate-500" />}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={!isEditing || readOnly}
                placeholder={placeholder}
                className={`w-full bg-slate-900/50 border ${isEditing && !readOnly ? 'border-slate-600 focus:border-sky-500' : 'border-transparent'} rounded-lg py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-slate-200 focus:outline-none transition-all`}
            />
        </div>
        {!isEditing && !readOnly && <div className="absolute inset-0 border-b border-slate-700 pointer-events-none group-hover:border-slate-600"></div>}
    </div>
);

const SelectDropdown = ({ label, value, onChange, options, isEditing }) => (
    <div className="relative group">
        <label className="text-xs text-slate-400 mb-1 block uppercase tracking-wider">{label}</label>
        {isEditing ? (
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 focus:border-sky-500 rounded-lg py-2.5 px-4 text-slate-200 focus:outline-none transition-all appearance-none"
            >
                <option value="" disabled>Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input
                type="text"
                value={value}
                readOnly
                className="w-full bg-slate-900/50 border border-transparent rounded-lg py-2.5 pl-4 pr-4 text-slate-200 focus:outline-none"
            />
        )}
        {!isEditing && <div className="absolute inset-0 border-b border-slate-700 pointer-events-none group-hover:border-slate-600"></div>}
    </div>
);

const SalaryRow = ({ label, data, onChange, isEditing, subtext }) => (
    <div className="mb-2">
        <div className="flex items-center justify-between gap-4 mb-1">
            <label className="text-sm text-slate-300 w-1/3 font-medium">{label}</label>
            <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">₹</span>
                    <input
                        type="number"
                        value={data.amount}
                        onChange={(e) => onChange('amount', e.target.value)}
                        readOnly={!isEditing}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-right text-sm focus:border-sky-500 outline-none transition-all"
                    />
                </div>
                <span className="text-slate-500 text-xs">/mo</span>

                <div className="relative w-24">
                    <input
                        type="number"
                        value={data.percentage ?? 0}
                        onChange={(e) => onChange('percentage', e.target.value)}
                        readOnly={!isEditing}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-3 pr-7 text-right text-sm focus:border-sky-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">%</span>
                </div>
            </div>
        </div>
        {subtext && <p className="text-[10px] text-slate-500 italic ml-[33%]">{subtext.replace('undefined', '0')}</p>}
    </div>
);

const TextArea = ({ value, onChange, isEditing, placeholder }) => (
    <textarea
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={!isEditing}
        placeholder={placeholder}
        rows={4}
        className={`w-full bg-slate-900/50 border ${isEditing ? 'border-slate-600 focus:border-sky-500' : 'border-transparent'} rounded-lg p-4 text-slate-300 focus:outline-none transition-all resize-none`}
    />
);

export default ProfilePage;
