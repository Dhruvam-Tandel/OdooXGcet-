import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-background text-slate-100 font-sans">
            <Navbar />
            <div className="flex-1 ml-64 p-8 overflow-y-auto relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-96 bg-sky-900/10 blur-[120px] pointer-events-none"></div>
                {children}
            </div>
        </div>
    );
};
export default Layout;
