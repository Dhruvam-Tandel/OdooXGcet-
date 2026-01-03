import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const CalendarComponent = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/attendance/my-history');
                setAttendanceData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();
    }, []);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const getStatusForDay = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const record = attendanceData.find(r => new Date(r.date).toDateString() === dateStr);
        return record ? record.status : null;
    };

    const renderDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-slate-800/20 rounded-lg"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const status = getStatusForDay(day);
            let statusColor = 'bg-slate-800 hover:bg-slate-700';
            let statusText = ''; // Default empty

            if (status === 'Present') {
                statusColor = 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30';
                statusText = 'Present';
            } else if (status === 'Absent') {
                statusColor = 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
                statusText = 'Absent';
            } else if (status === 'Half-day') {
                statusColor = 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30';
                statusText = 'Half Day';
            }

            days.push(
                <div key={day} className={`h-24 p-2 rounded-xl transition-colors border border-transparent ${statusColor} cursor-pointer group relative`}>
                    <span className="text-slate-300 font-medium">{day}</span>
                    {status && (
                        <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${status === 'Present' ? 'bg-green-500 text-green-950' :
                                    status === 'Absent' ? 'bg-red-500 text-white' :
                                        'bg-yellow-500 text-yellow-950'
                                }`}>
                                {status}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    return (
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Monthly Attendance</h2>
                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><ChevronLeft /></button>
                    <span className="text-lg font-medium text-slate-200">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-2 text-center text-slate-500 text-sm font-medium">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-4">
                {renderDays()}
            </div>
        </div>
    );
};

export default CalendarComponent;
