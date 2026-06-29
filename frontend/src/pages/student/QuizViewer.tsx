import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Quiz {
  id: string;
  title: string;
  passMark: number;
  questions: Question[];
  level: {
    courseId: string;
  }
}

export default function QuizViewer() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/level/${levelId}`);
        if (!data) {
          alert('No quiz found for this level.');
          navigate(-1);
          return;
        }
        setQuiz(data);
      } catch (err) {
        console.error(err);
        alert('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [levelId, navigate]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${quiz.id}/submit`, { answers });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-zinc-400">Loading quiz...</div>;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl">
        {result.passed ? (
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4" />
        ) : (
          <XCircle className="mx-auto h-20 w-20 text-red-500 mb-4" />
        )}
        <h2 className="text-3xl font-bold text-white mb-2">
          {result.passed ? 'Congratulations!' : 'Keep Trying!'}
        </h2>
        <p className="text-zinc-400 mb-6">You scored {result.score.toFixed(1)}%</p>
        
        {result.passed ? (
          <div className="bg-indigo-600/20 text-indigo-300 p-4 rounded-lg mb-8 inline-block">
            <strong>+50 XP Earned!</strong> You have unlocked the next level.
          </div>
        ) : (
          <p className="text-red-400 mb-8">You need {quiz.passMark}% to pass. Please review the material and try again.</p>
        )}

        <button 
          onClick={() => navigate(-1)} // Go back to course
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Course
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
          <p className="text-zinc-400 mt-2">Answer all {quiz.questions.length} questions to complete this level. Pass mark is {quiz.passMark}%.</p>
        </div>

        <div className="space-y-8">
          {quiz.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-zinc-950 p-6 rounded-lg border border-zinc-800/50">
              <h3 className="text-lg font-medium text-zinc-200 mb-4">
                <span className="text-indigo-400 mr-2">{qIndex + 1}.</span>
                {question.text}
              </h3>
              
              <div className="space-y-3">
                {question.options.map((option, oIndex) => {
                  const isSelected = answers[question.id] === oIndex;
                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelectOption(question.id, oIndex)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        isSelected 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100' 
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < quiz.questions.length}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium transition shadow-lg shadow-indigo-900/20"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
