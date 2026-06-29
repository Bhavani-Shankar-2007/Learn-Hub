import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { BookOpen, PlayCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  levels: any[];
}

export default function ExploreCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        setCourses(data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      alert('Successfully enrolled!');
      // Navigate to course viewer or dashboard
      navigate('/student');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading) return <div className="flex justify-center p-12 text-zinc-400">Loading courses...</div>;
  if (error) return <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Explore Courses</h1>
      <p className="text-zinc-400 mb-8">Discover new skills and level up your knowledge.</p>
      
      {courses.length === 0 ? (
        <div className="text-center p-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <BookOpen className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No courses available</h3>
          <p className="text-zinc-400">Check back later for new content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-indigo-500/50 transition flex flex-col">
              <div className="h-48 bg-zinc-800 flex items-center justify-center">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-16 w-16 text-zinc-700" />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-1 line-clamp-3">
                  {course.description || 'No description available for this course.'}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                  <div className="text-sm text-zinc-500 flex items-center gap-2">
                    <PlayCircle size={16} />
                    {course.levels?.length || 0} Levels
                  </div>
                  <button 
                    onClick={() => handleEnroll(course.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
