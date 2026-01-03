import { useState } from 'react';
import axios from 'axios';
import { X, User, Mail, Briefcase, Building, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'employee',
        department: '',
        position: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/auth/create-employee', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`success: ${res.data.message}`);
            // Reset form
            setFormData({ name: '', email: '', role: 'employee', department: '', position: '', phone: '' });
            if (onEmployeeAdded) onEmployeeAdded();
            setTimeout(() => {
                onClose();
                setMessage('');
            }, 2000);
        } catch (err) {
            setMessage(`error: ${err.response?.data?.message || 'Failed to create employee'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
                        <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.replace('success: ', '').replace('error: ', '')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                            placeholder="+1 234..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Login credentials will be sent to this email.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                            placeholder="Engineering"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Position</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                            placeholder="Developer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-4 text-sm text-slate-200 focus:ring-1 focus:ring-sky-500 outline-none"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="hr">HR Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-sky-500/25 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddEmployeeModal;
