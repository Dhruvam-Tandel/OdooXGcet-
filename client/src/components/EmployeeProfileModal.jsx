import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Briefcase, Calendar, MapPin, User as UserIcon } from 'lucide-react';

const EmployeeProfileModal = ({ employee, onClose }) => {
    if (!employee) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-surface border border-slate-600 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header with Cover */}
                    <div className="h-32 bg-gradient-to-r from-sky-600 to-indigo-600 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="px-8 pb-8 -mt-12 relative">
                        <div className="w-24 h-24 rounded-full bg-slate-900 p-1 mb-4">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
                                {employee.name.charAt(0)}
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                                <p className="text-sky-400">{employee.position || 'Employee'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${employee.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    employee.status === 'On Leave' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                {employee.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                                    <Mail size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Email</p>
                                        <p className="text-sm text-slate-200 truncate" title={employee.email}>{employee.email}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                                    <Briefcase size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">ID</p>
                                        <p className="text-sm text-slate-200">{employee.employeeId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                                    <UserIcon size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Department</p>
                                        <p className="text-sm text-slate-200">{employee.department || 'General'}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
                                    <Calendar size={18} className="text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Joined</p>
                                        <p className="text-sm text-slate-200">{new Date(employee.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmployeeProfileModal;
