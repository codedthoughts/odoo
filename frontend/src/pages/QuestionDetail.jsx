import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../store/authStore';
import RichTextEditor from '../components/RichTextEditor';
import Loader from '../components/Loader';
import { ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';

const QuestionDetail = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answerContent, setAnswerContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuthStore();

    const fetchQuestion = async () => {
        try {
            // Don't set loading to true on re-fetches, only initial load
            // setLoading(true); 
            const res = await api.get(`/questions/${id}`);
            setQuestion(res.data);
        } catch (err) {
            setError('Failed to fetch question.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true); // Set loading to true only on initial component mount
        fetchQuestion();
    }, [id]);

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!answerContent.trim()) {
            alert('Answer cannot be empty.');
            return;
        }
        try {
            await api.post(`/answers/question/${id}`, { content: answerContent });
            setAnswerContent(''); // Clear the editor
            fetchQuestion(); // Re-fetch the question to show the new answer
        } catch (err) {
            alert('Failed to post answer. Please try again.');
        }
    };

    const handleVote = async (answerId, voteType) => {
        if (!user) {
            alert('You must be logged in to vote.');
            return;
        }
        
        // Keep a copy of the original state for rollback
        const originalQuestion = JSON.parse(JSON.stringify(question));

        // Optimistic UI Update
        const updatedAnswers = question.answers.map(a => {
            if (a._id === answerId) {
                const alreadyUpvoted = a.upvotes.includes(user.id);
                const alreadyDownvoted = a.downvotes.includes(user.id);
                let newUpvotes = [...a.upvotes];
                let newDownvotes = [...a.downvotes];

                if (voteType === 'upvote') {
                    if (alreadyUpvoted) {
                        newUpvotes = newUpvotes.filter(uid => uid !== user.id);
                    } else {
                        newUpvotes.push(user.id);
                        newDownvotes = newDownvotes.filter(uid => uid !== user.id);
                    }
                } else { // downvote
                    if (alreadyDownvoted) {
                        newDownvotes = newDownvotes.filter(uid => uid !== user.id);
                    } else {
                        newDownvotes.push(user.id);
                        newUpvotes = newUpvotes.filter(uid => uid !== user.id);
                    }
                }
                return { ...a, upvotes: newUpvotes, downvotes: newDownvotes };
            }
            return a;
        });
        setQuestion({ ...question, answers: updatedAnswers });

        // API Call
        try {
            await api.post(`/answers/${answerId}/vote`, { voteType });
        } catch (err) {
            // Rollback on error
            setQuestion(originalQuestion);
            alert('Your vote could not be saved. Please try again.');
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        if (question.acceptedAnswer === answerId) return;

        const originalAcceptedAnswer = question.acceptedAnswer;

        // Optimistic UI Update: Immediately update the UI
        setQuestion(prev => ({ ...prev, acceptedAnswer: answerId }));

        try {
            // API Call
            await api.post(`/answers/question/${id}/accept/${answerId}`);
        } catch (err) {
            // Rollback on error: If the API fails, revert the UI to its original state.
            setQuestion(prev => ({ ...prev, acceptedAnswer: originalAcceptedAnswer }));
            alert('Failed to accept answer. Please try again.');
        }
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!question) return <p className="text-center">Question not found.</p>;

    const isQuestionOwner = user?.id === question.author._id;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Question Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
                <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: question.content }} />
                <div className="flex flex-wrap gap-2">
                    {question.tags.map(tag => <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>)}
                </div>
                <p className="text-sm text-gray-500 mt-4">Asked by {question.author.username} on {new Date(question.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Answers Section */}
            <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold p-6 border-b">{question.answers.length} Answers</h2>
                {question.answers.map(answer => (
                    <div key={answer._id} className={`p-6 border-b last:border-b-0 flex gap-4 ${question.acceptedAnswer === answer._id ? 'bg-green-50' : ''}`}>
                        <div className="flex flex-col items-center space-y-1 text-gray-600">
                            <ArrowUp className="cursor-pointer hover:text-green-600" onClick={() => handleVote(answer._id, 'upvote')} />
                            <span className="font-bold text-lg">{answer.upvotes.length - answer.downvotes.length}</span>
                            <ArrowDown className="cursor-pointer hover:text-red-600" onClick={() => handleVote(answer._id, 'downvote')} />
                            {isQuestionOwner && (
                                <CheckCircle2 
                                    size={28} 
                                    className={`mt-3 cursor-pointer ${question.acceptedAnswer === answer._id ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                    onClick={() => handleAcceptAnswer(answer._id)}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: answer.content }} />
                            <p className="text-sm text-gray-500 mt-4">Answered by {answer.author.username} on {new Date(answer.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Post Answer Form */}
            {user && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4">Your Answer</h3>
                    <form onSubmit={handleAnswerSubmit}>
                        <RichTextEditor value={answerContent} onChange={setAnswerContent} />
                        <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Post Your Answer</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default QuestionDetail;