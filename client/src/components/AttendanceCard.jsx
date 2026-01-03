import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceCard = () => {
    const [status, setStatus] = useState(null); // 'Present', 'Absent', etc.
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Confirmation Modal State
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState(null); // 'check-in' or 'check-out'

    useEffect(() => {
        // Current Time Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch Status
        const fetchStatus = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/attendance/today');
                if (res.data && res.data.checkInTime) {
                    setCheckInTime(new Date(res.data.checkInTime));
                    setStatus('Checked In');
                }
                if (res.data && res.data.checkOutTime) {
                    setCheckOutTime(new Date(res.data.checkOutTime));
                    setStatus('Checked Out');
                }
            } catch (err) {
                console.error("Error fetching status", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();

        return () => clearInterval(timer);
    }, []);

    const triggerAction = (type) => {
        setActionType(type);
        setShowModal(true);
    };

    const confirmAction = async () => {
        setShowModal(false);
        try {
            if (actionType === 'check-in') {
                const res = await axios.post('http://localhost:5000/api/attendance/checkin');
                setCheckInTime(new Date(res.data.checkInTime));
                setStatus('Checked In');
            } else {
                const res = await axios.post('http://localhost:5000/api/attendance/checkout');
                setCheckOutTime(new Date(res.data.checkOutTime));
                setStatus('Checked Out');
            }
        } catch (err) {
            alert(actionType + ' failed: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div className="p-6 bg-surface rounded-xl animate-pulse h-48"></div>;

    return (
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden">
            {/* Confirmation Modal */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-surface border border-slate-600 p-6 rounded-xl shadow-2xl w-full max-w-sm text-center"
                    >
                        <h3 className="text-lg font-bold text-white mb-2">Confirm Action</h3>
                        <p className="text-slate-300 mb-6">Are you sure you want to <span className="font-bold text-sky-400 uppercase">{actionType}</span> now?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors">Cancel</button>
                            <button onClick={confirmAction} className="flex-1 py-2 rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-400 transition-colors">Confirm</button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-200">Today's Attendance</h2>
                    <p className="text-slate-400 text-sm">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-sky-400 font-mono text-xl font-bold bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                    {currentTime.toLocaleTimeString()}
                </div>
            </div>

            <div className="flex items-center justify-between">
                {/* Status Indicator */}
                <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${checkInTime ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/50 text-slate-500'}`}>
                            <CheckCircle />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Check In</p>
                            <p className="text-lg font-medium text-white">
                                {checkInTime ? checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-700 ml-6 -my-2"></div> {/* Connector Line */}

                    <div className="flex items-center space-x-4 mt-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${checkOutTime ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-500'}`}>
                            <XCircle />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Check Out</p>
                            <p className="text-lg font-medium text-white">
                                {checkOutTime ? checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-center justify-center pl-8 border-l border-slate-700">
                    {!checkInTime ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => triggerAction('check-in')}
                            className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold shadow-lg shadow-green-500/25 flex flex-col items-center justify-center gap-2"
                        >
                            <Clock size={32} />
                            <span>Check In</span>
                        </motion.button>
                    ) : !checkOutTime ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => triggerAction('check-out')}
                            className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold shadow-lg shadow-red-500/25 flex flex-col items-center justify-center gap-2"
                        >
                            <LogOut size={32} className="rotate-180" /> {/* Rotate check out icon */}
                            <span>Check Out</span>
                        </motion.button>
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-slate-600 flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle size={32} />
                            <span className="text-sm font-medium mt-1">Done</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceCard;
