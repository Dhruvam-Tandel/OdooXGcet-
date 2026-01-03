import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/auth/change-password',
                { newPassword: password },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage('success: Password updated!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-background to-background pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-surface/50 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Secure Your Account</h1>
                    <p className="text-slate-400 text-sm">Please set a new permanent password.</p>
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.startsWith('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.replace('success: ', '')}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-12 text-slate-200 outline-none focus:border-sky-500 focus:ring-1 transition-all"
                            placeholder="New Password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 outline-none focus:border-sky-500 focus:ring-1 transition-all"
                            placeholder="Confirm New Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-sky-500/25 transition-all"
                    >
                        Update Password
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ChangePassword;
