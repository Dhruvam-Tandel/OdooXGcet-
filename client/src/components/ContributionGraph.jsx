import { useState, useEffect } from 'react';
import axios from 'axios';

const ContributionGraph = () => {
    const [data, setData] = useState([]);
    const [yearData, setYearData] = useState({});

    useEffect(() => {
        const fetchHeatmap = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const res = await axios.get('http://localhost:5000/api/attendance/heatmap', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setYearData(res.data);
            } catch (err) {
                console.error("Error fetching heatmap", err);
            }
        };
        fetchHeatmap();
    }, []);

    const getColor = (dateStr) => {
        const level = yearData[dateStr] || 0;
        switch (level) {
            case 0: return 'bg-slate-800/50 border border-slate-700/50'; // Empty box visible
            case 1: return 'bg-sky-900 border border-sky-800';
            case 2: return 'bg-sky-600 border border-sky-500';
            case 3: return 'bg-sky-400 shadow-lg shadow-sky-400/50 border border-sky-300';
            default: return 'bg-slate-800/50 border border-slate-700/50';
        }
    };

    // Helper to get date string YYYY-MM-DD
    const getDateStr = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Generate last 365 days
    const generateDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push(getDateStr(d));
        }
        return days;
    };

    const days = generateDays();

    return (
        <div className="bg-surface p-6 rounded-2xl border border-slate-700 shadow-lg overflow-x-auto">
            <h2 className="text-xl font-bold text-white mb-4">Consistency (Past Year)</h2>
            <div className="flex gap-1 min-w-max">
                {/* 52 columns approx */}
                {Array.from({ length: 53 }).map((_, colIndex) => (
                    <div key={colIndex} className="grid grid-rows-7 gap-1">
                        {Array.from({ length: 7 }).map((_, rowIndex) => {
                            const dayIndex = colIndex * 7 + rowIndex;
                            if (dayIndex >= days.length) return null;
                            const dateStr = days[dayIndex];

                            return (
                                <div
                                    key={dateStr}
                                    className={`w-3 h-3 rounded-sm ${getColor(dateStr)}`}
                                    title={`${dateStr}: Level ${yearData[dateStr] || 0}`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-sky-900 rounded-sm"></div>
                <div className="w-3 h-3 bg-sky-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-sky-400 rounded-sm"></div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ContributionGraph;
