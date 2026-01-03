import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { motion } from 'framer-motion';

const LeavePage = () => {
    const [leaves, setLeaves] = useState([]);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'Paid',
        reason: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/leaves/my');
            setLeaves(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/leaves', formData);
            setMessage('Leave Request Submitted!');
            setFormData({ startDate: '', endDate: '', type: 'Paid', reason: '' });
            fetchLeaves();
        } catch (err) {
            setMessage('Error submitting request');
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Leave Management</h1>
                <p className="text-slate-400">Apply for leaves and track status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Apply Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg"
                >
                    <h2 className="text-xl font-bold text-white mb-6">Apply for Leave</h2>
                    {message && <div className="mb-4 p-2 bg-sky-500/20 text-sky-200 rounded">{message}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Leave Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                            >
                                <option>Paid</option>
                                <option>Sick</option>
                                <option>Unpaid</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white"
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        <button className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-sky-500/25 transition-all">
                            Submit Request
                        </button>
                    </form>
                </motion.div>

                {/* History List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg"
                >
                    <h2 className="text-xl font-bold text-white mb-6">Recent Requests</h2>
                    <div className="space-y-4">
                        {leaves.length === 0 ? <p className="text-slate-500">No requests found.</p> : leaves.map(leave => (
                            <div key={leave._id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-white">{leave.type} Leave</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${leave.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                                leave.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                            }`}>{leave.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">{new Date(leave.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default LeavePage;
