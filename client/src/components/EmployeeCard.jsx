import { motion } from 'framer-motion';
import { Plane, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeCard = ({ employee, onClick }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present':
                return <CheckCircle size={18} className="text-green-500 fill-green-500/20" />;
            case 'On Leave':
                return <Plane size={18} className="text-blue-500 fill-blue-500/20" />;
            case 'Absent':
            default:
                return <div className="w-4 h-4 rounded-full bg-yellow-500/50 border-2 border-yellow-500" />;
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onClick(employee)}
            className="cursor-pointer bg-surface border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 relative shadow-lg hover:shadow-sky-500/10 hover:border-sky-500/50 transition-all group"
        >
            <div className="absolute top-3 right-3">
                {getStatusIcon(employee.status)}
            </div>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                {employee.name.charAt(0)}
            </div>

            <div className="text-center">
                <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors">{employee.name}</h3>
                <p className="text-xs text-slate-400">{employee.role}</p>
            </div>

            <div className="w-full mt-2 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                <span>{employee.department || 'General'}</span>
            </div>
        </motion.div>
    );
};

export default EmployeeCard;
