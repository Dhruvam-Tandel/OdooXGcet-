import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Plus, User, LogOut, Clock, Calendar } from 'lucide-react';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeProfileModal from '../components/EmployeeProfileModal';
import AddEmployeeModal from '../components/AddEmployeeModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState('Employees'); // Employees, Attendance, Time Off
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

    // Initial Load
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (!searchQuery) {
            setFilteredEmployees(employees);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredEmployees(employees.filter(emp =>
                emp.name.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query)
            ));
        }
    }, [searchQuery, employees]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/attendance/employee-status', {
                headers: { Authorization: `Bearer ${token} ` }
            });
            setEmployees(res.data);
            setFilteredEmployees(res.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background text-slate-100 font-sans">
            {/* Top Navigation Bar */}
            <div className="h-16 border-b border-slate-700 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-8">
                    {/* Logo Area */}
                    <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                        Dayflow
                    </h1>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl">
                        {['Employees', 'Attendance', 'Time Off'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-slate-700 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded-full transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center font-bold text-white text-xs overflow-hidden border border-slate-600">
                                {user?.profileImage ? (
                                    <img
                                        src={`http://localhost:5000${user.profileImage}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.name?.charAt(0) || 'A'
                                )}
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                                >
                                    <User size={16} /> My Profile
                                </button>
                                <div className="border-t border-slate-700 my-1"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2">
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8 max-w-7xl mx-auto">
                {/* Check In Widget (Top Right Floating or Standard) */}


                {/* Function Bar */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => setShowAddEmployeeModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Plus size={18} />
                        <span>NEW</span>
                    </button>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {activeTab === 'Employees' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredEmployees.map(emp => (
                            <EmployeeCard
                                key={emp._id}
                                employee={emp}
                                onClick={setSelectedEmployee}
                            />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'Attendance' && (
                    <div className="text-center py-20 text-slate-500">
                        <Clock className="mx-auto mb-4 opacity-50" size={48} />
                        <h2 className="text-xl font-bold mb-2">Attendance View</h2>
                        <p>Detailed attendance logs coming soon.</p>
                    </div>
                )}

                {activeTab === 'Time Off' && (
                    <div className="text-center py-20 text-slate-500">
                        <Calendar className="mx-auto mb-4 opacity-50" size={48} />
                        <h2 className="text-xl font-bold mb-2">Leave Management</h2>
                        <p>Leave requests and history.</p>
                    </div>
                )}

            </div>

            {/* Profile Modal */}
            <EmployeeProfileModal
                employee={selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
            />

            {/* Add Employee Modal */}
            <AddEmployeeModal
                isOpen={showAddEmployeeModal}
                onClose={() => setShowAddEmployeeModal(false)}
                onEmployeeAdded={() => {
                    fetchEmployees();
                    // setShowAddEmployeeModal(false); // Modal closes itself after success message
                }}
            />
        </div>
    );
};

export default AdminDashboard;
