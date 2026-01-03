import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Calendar, CreditCard, User, Award } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <button
                onClick={() => navigate(to)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${isActive ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
            >
                <Icon size={18} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <nav className="w-64 bg-surface border-r border-slate-700 p-6 flex flex-col h-screen fixed left-0 top-0">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Dayflow</h1>
            </div>

            <div className="space-y-2 flex-1">
                <NavItem to="/dashboard" icon={Home} label="Dashboard" />
                <NavItem to="/calendar" icon={Calendar} label="Calendar" />
                <NavItem to="/leaves" icon={Award} label="Leaves" />
                <NavItem to="/payroll" icon={CreditCard} label="Payroll" />
                <NavItem to="/profile" icon={User} label="My Profile" />
            </div>

            <div className="pt-6 border-t border-slate-700">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-3 mb-4 px-2 w-full hover:bg-slate-800 rounded-lg p-2 transition-colors text-left group"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-sky-500 transition-all">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate group-hover:text-sky-400 transition-colors">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
                    </div>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg transition-colors border border-slate-700 hover:border-red-500/50"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
