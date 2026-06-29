import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Book, Compass, Layout, Trophy, LogOut, PlayCircle } from 'lucide-react';
import ExploreCourses from './ExploreCourses';
import Library from './Library';
import CourseViewer from './CourseViewer';
import QuizViewer from './QuizViewer';

const StudentOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard/student');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-zinc-400">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-900/50 to-zinc-900 border border-indigo-500/20 p-6 rounded-xl relative overflow-hidden">
           <h3 className="text-indigo-200/80 mb-2 font-medium">My XP</h3>
           <p className="text-4xl font-bold text-indigo-400">{user?.xp || 0}</p>
           <Trophy className="absolute right-4 bottom-4 opacity-20 text-indigo-400" size={60} />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Daily Streak</h3>
           <p className="text-4xl font-bold text-orange-400">🔥 {user?.dailyStreak || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Courses in Progress</h3>
           <p className="text-4xl font-bold">{stats?.enrollments?.length || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
           <h3 className="text-zinc-400 mb-2">Books Owned</h3>
           <p className="text-4xl font-bold">{stats?.bookPurchases?.length || 0}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 border-b border-zinc-800 pb-2">My Enrolled Courses</h2>
      {stats?.enrollments?.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-zinc-400 mb-4">You haven't enrolled in any courses yet.</p>
          <Link to="/student/explore" className="text-indigo-400 hover:text-indigo-300 font-medium">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.enrollments?.map((enrollment: any) => (
            <Link key={enrollment.course.id} to={`/student/course/${enrollment.course.id}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/50 transition group flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition mb-2">{enrollment.course.title}</h3>
                <div className="w-48 bg-zinc-800 rounded-full h-2 mb-1">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                </div>
                <span className="text-xs text-zinc-500">{Math.round(enrollment.progress)}% Completed</span>
              </div>
              <PlayCircle size={32} className="text-zinc-600 group-hover:text-indigo-400 transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-white" : "text-zinc-400 hover:text-zinc-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="font-bold text-xl flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">LH</div>
           <span>LearnHub</span>
        </div>
        <div className="flex items-center gap-6">
           <Link to="/student" className={`flex items-center gap-2 transition ${isActive('/student')}`}>
             <Layout size={18} /> Dashboard
           </Link>
           <Link to="/student/explore" className={`flex items-center gap-2 transition ${isActive('/student/explore')}`}>
             <Compass size={18} /> Explore
           </Link>
           <Link to="/student/books" className={`flex items-center gap-2 transition ${isActive('/student/books')}`}>
             <Book size={18} /> Library
           </Link>
           <div className="h-8 w-px bg-zinc-800"></div>
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-indigo-600/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
               <Trophy size={14} className="text-indigo-400" />
               <span className="text-sm font-bold text-indigo-300">{user?.xp || 0} XP</span>
             </div>
             <span className="text-sm font-medium text-zinc-300">{user?.name}</span>
             <button onClick={logout} className="text-zinc-400 hover:text-red-400 transition p-2 bg-zinc-800/50 rounded-lg">
                <LogOut size={18} />
             </button>
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<StudentOverview />} />
          <Route path="/explore" element={<ExploreCourses />} />
          <Route path="/books" element={<Library />} />
          <Route path="/course/:courseId" element={<CourseViewer />} />
          <Route path="/quiz/:levelId" element={<QuizViewer />} />
        </Routes>
      </div>
    </div>
  );
}
