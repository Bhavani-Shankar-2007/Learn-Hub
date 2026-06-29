import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Users, LayoutDashboard, Settings, LogOut } from 'lucide-react';

const AdminOverview = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Total Students</h3>
           <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Total Courses</h3>
           <p className="text-3xl font-bold">5</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Total Revenue</h3>
           <p className="text-3xl font-bold">₹4,500</p>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 font-bold text-xl text-indigo-400">
          LearnHub Admin
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to="/admin" className="flex items-center space-x-3 px-4 py-3 bg-zinc-800/50 text-indigo-400 rounded-lg">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/courses" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition">
            <BookOpen size={20} />
            <span>Courses</span>
          </Link>
          <Link to="/admin/students" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition">
            <Users size={20} />
            <span>Students</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/courses" element={<div>Courses Management Coming Soon</div>} />
          <Route path="/students" element={<div>Student Management Coming Soon</div>} />
        </Routes>
      </div>
    </div>
  );
}
