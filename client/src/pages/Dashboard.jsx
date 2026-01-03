import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AttendanceCard from '../components/AttendanceCard';
import ContributionGraph from '../components/ContributionGraph';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Award, CalendarCheck, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ avgCheckIn: '--:--', attendanceScore: 0 });

    useEffect(() => {
        // Basic Role Redirection
        if (user?.role === 'admin') {
            window.location.href = '/admin';
        }

        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/attendance/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats");
            }
        };
        fetchStats();
    }, [user]);

    const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group hover:border-slate-600 transition-colors"
        >
            {/* Background Icon REMOVED based on feedback */}
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                    {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-white`}>
                    <Icon size={24} />
                </div>
            </div>
        </motion.div>
    );

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Good Morning, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-slate-400">Here's your daily overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <AttendanceCard />

                <StatCard
                    icon={TrendingUp}
                    title="Avg. Check-in"
                    value={stats.avgCheckIn}
                    subtext="This Month"
                    color="bg-sky-500"
                />
                <StatCard
                    icon={CalendarCheck}
                    title="Attendance Score"
                    value={`${stats.attendanceScore}%`}
                    subtext="Consistency"
                    color="bg-green-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Activity Heatmap</h3>
                    <div className="overflow-x-auto">
                        <ContributionGraph />
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/leaves" className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 transition-colors flex items-center gap-3">
                            <Award size={18} className="text-purple-400" />
                            Apply for Leave
                        </Link>
                        <Link to="/calendar" className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 transition-colors flex items-center gap-3">
                            <Clock size={18} className="text-orange-400" />
                            View History
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
export default Dashboard;
