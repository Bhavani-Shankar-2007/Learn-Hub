import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { PlayCircle, CheckCircle, Lock } from 'lucide-react';

interface Level {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  quiz?: any;
}

interface Course {
  id: string;
  title: string;
  description: string;
  levels: Level[];
}

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [{ data: courseData }, { data: dashboardData }] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get('/dashboard/student')
        ]);

        const myEnrollment = dashboardData.enrollments.find((e: any) => e.courseId === courseId);
        
        if (!myEnrollment) {
           alert("You are not enrolled in this course.");
           navigate('/student/explore');
           return;
        }

        setCourse(courseData);
        setEnrollment(myEnrollment);
        
        // Find the active level based on unlockedLevelId
        let initialLevel = courseData.levels[0];
        if (myEnrollment.unlockedLevelId) {
          const unlockedIndex = courseData.levels.findIndex((l: Level) => l.id === myEnrollment.unlockedLevelId);
          if (unlockedIndex !== -1) {
            initialLevel = courseData.levels[unlockedIndex];
          }
        } else if (myEnrollment.progress === 100) {
          initialLevel = courseData.levels[courseData.levels.length - 1];
        }

        setActiveLevel(initialLevel);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, navigate]);

  if (loading) return <div className="p-12 text-center text-zinc-400">Loading course...</div>;
  if (!course || !activeLevel) return <div className="p-12 text-center text-red-500">Course not found</div>;

  // Determine which levels are unlocked
  const activeIndex = course.levels.findIndex(l => l.id === activeLevel.id);
  const unlockedIndex = enrollment.progress === 100 
     ? course.levels.length 
     : course.levels.findIndex(l => l.id === enrollment.unlockedLevelId);

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Video Content Area */}
      <div className="flex-1 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
        
        <div className="bg-black rounded-xl overflow-hidden aspect-video w-full mb-6 border border-zinc-800 shadow-2xl">
          <iframe 
            src={activeLevel.videoUrl} 
            title={activeLevel.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-bold text-white">{activeLevel.order}. {activeLevel.title}</h2>
             {activeLevel.quiz && (
               <Link 
                 to={`/student/quiz/${activeLevel.id}`}
                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
               >
                 Take Quiz to Unlock Next
               </Link>
             )}
          </div>
          <p className="text-zinc-400">{activeLevel.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Course Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 border-b border-zinc-800 pb-2">Course Content</h3>
          
          <div className="flex flex-col gap-2">
            {course.levels.map((level, index) => {
              const isUnlocked = index <= unlockedIndex;
              const isCompleted = index < unlockedIndex || enrollment.progress === 100;
              const isCurrent = activeLevel.id === level.id;

              return (
                <button
                  key={level.id}
                  disabled={!isUnlocked}
                  onClick={() => setActiveLevel(level)}
                  className={`flex items-start gap-3 p-3 rounded-lg text-left transition ${
                    isCurrent ? 'bg-indigo-600/10 border-indigo-500/50 border' : 
                    isUnlocked ? 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent' : 
                    'opacity-50 cursor-not-allowed border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : isUnlocked ? (
                      <PlayCircle size={18} className={isCurrent ? "text-indigo-400" : "text-zinc-400"} />
                    ) : (
                      <Lock size={18} className="text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm ${isCurrent ? 'text-indigo-300' : isUnlocked ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {level.order}. {level.title}
                    </h4>
                    {level.quiz && <p className="text-xs text-zinc-500 mt-1">Includes Quiz</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
