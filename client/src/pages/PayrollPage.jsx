import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Download, DollarSign } from 'lucide-react';

const PayrollPage = () => {
    const [history, setHistory] = useState([]);
    const [structure, setStructure] = useState(null);

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/payroll/my');
                setHistory(res.data.history);
                setStructure(res.data.structure);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPayroll();
    }, []);

    const SalaryItem = ({ label, amount, isDeduction = false }) => (
        <div className="flex justify-between py-2 border-b border-slate-700/50 last:border-0">
            <span className="text-slate-400">{label}</span>
            <span className={`font-medium ${isDeduction ? 'text-red-400' : 'text-slate-200'}`}>
                {isDeduction ? '-' : ''}₹{amount?.toLocaleString()}
            </span>
        </div>
    );

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Payroll & Salary</h1>
                <p className="text-slate-400">View your salary structure and payslips.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Structure Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg h-fit"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                            <DollarSign size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Salary Structure</h2>
                    </div>

                    <div className="space-y-1 mb-6">
                        <SalaryItem label="Basic Salary" amount={structure?.basic || 0} />
                        <SalaryItem label="HRA" amount={structure?.hra || 0} />
                        <SalaryItem label="Allowances" amount={structure?.allowances || 0} />
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300 font-semibold">Gross Salary</span>
                            <span className="text-xl font-bold text-green-400">
                                ₹{((structure?.basic || 0) + (structure?.hra || 0) + (structure?.allowances || 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* History List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Payslip History</h2>
                    {history.length === 0 ? <p className="text-slate-500">No payslips generated yet.</p> : history.map((slip) => (
                        <motion.div
                            key={slip._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-surface p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{slip.month} {slip.year}</p>
                                    <p className="text-xs text-slate-400">Processed on {new Date(slip.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="text-right">
                                    <p className="text-sm text-slate-400">Net Pay</p>
                                    <p className="text-lg font-bold text-white">₹{slip.netSalary?.toLocaleString()}</p>
                                </div>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-sky-400 transition-colors" title="Download Slip">
                                    <Download size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default PayrollPage;
