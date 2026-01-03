import Layout from '../components/Layout';
import CalendarComponent from '../components/CalendarComponent';
import ContributionGraph from '../components/ContributionGraph';

const AttendancePage = () => {
    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Attendance History</h1>
                <p className="text-slate-400">View your attendance records and consistency.</p>
            </div>

            <ContributionGraph />

            <div className="mt-8">
                <CalendarComponent />
            </div>
        </Layout>
    );
};

export default AttendancePage;
