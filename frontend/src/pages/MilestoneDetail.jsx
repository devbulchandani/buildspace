import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Lock, Info, AlertCircle, Circle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import useAppStore from '../store/useAppStore';
import { verificationApi } from '../api/verificationApi';
import { getErrorMessage } from '../api/errorHandler';

const ChecklistItem = ({ text, checked, onToggle }) => (
    <div
        onClick={onToggle}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${checked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-sky-300'}`}
    >
        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white border-slate-300'}`}>
            {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <span className={`text-sm ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{text}</span>
    </div>
);

const MilestoneDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { repoUrl, milestones, updateMilestoneStatus, currentPlan } = useAppStore();
    const [checklist, setChecklist] = useState([]);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const foundMilestone = milestones?.find(m => m.id === parseInt(id));
        
        if (foundMilestone) {
            setMilestone(foundMilestone);
            
            if (foundMilestone.learningObjectives) {
                const objectives = foundMilestone.learningObjectives
                    .split('\n')
                    .filter(obj => obj.trim())
                    .map((obj, index) => ({
                        id: index + 1,
                        text: obj.replace(/^[-*•]\s*/, '').trim(),
                        checked: foundMilestone.completed
                    }));
                setChecklist(objectives);
            } else {
                setChecklist([
                    { id: 1, text: "Understand the concepts", checked: foundMilestone.completed },
                    { id: 2, text: "Implement the solution", checked: foundMilestone.completed },
                    { id: 3, text: "Test your implementation", checked: foundMilestone.completed },
                ]);
            }
        }
        
        setLoading(false);
    }, [id, milestones]);

    const handleCheckMilestone = async () => {
        if (!currentPlan) {
            setFeedback({
                type: 'error',
                message: 'No active learning plan selected'
            });
            return;
        }

        if (!repoUrl) {
            setFeedback({
                type: 'error',
                message: 'Please provide a GitHub repository URL in your learning plan settings.'
            });
            return;
        }

        setIsChecking(true);
        setFeedback(null);

        try {
            const result = await verificationApi.verifyMilestone(id, repoUrl);

            setFeedback({
                type: result.completed ? 'success' : 'error',
                message: result.feedback
            });

            if (result.completed) {
                updateMilestoneStatus(parseInt(id), true);
                setChecklist(prev => prev.map(item => ({ ...item, checked: true })));
            }
        } catch (error) {
            console.error('Verification error:', error);
            setFeedback({
                type: 'error',
                message: getErrorMessage(error)
            });
        } finally {
            setIsChecking(false);
        }
    };

    const toggleItem = (itemId) => {
        setChecklist(checklist.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        ));
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto pb-10 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (!milestone) {
        return (
            <div className="max-w-4xl mx-auto pb-10">
                <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                </button>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-yellow-900 mb-2">Milestone Not Found</h2>
                    <p className="text-yellow-700">The milestone you're looking for doesn't exist or hasn't been loaded yet.</p>
                </div>
            </div>
        );
    }

    const getStatusInfo = () => {
        if (milestone.completed) {
            return {
                badgeClasses: 'bg-mint-50 text-mint-700 border-mint-200',
                numberClasses: 'bg-mint-100 text-mint-600 border-mint-200',
                label: 'COMPLETED',
                icon: CheckCircle2
            };
        }
        
        const milestoneIndex = milestones.findIndex(m => m.id === milestone.id);
        const previousMilestone = milestoneIndex > 0 ? milestones[milestoneIndex - 1] : null;
        
        if (previousMilestone && !previousMilestone.completed) {
            return {
                badgeClasses: 'bg-slate-50 text-slate-700 border-slate-200',
                numberClasses: 'bg-slate-100 text-slate-600 border-slate-200',
                label: 'LOCKED',
                icon: Lock
            };
        }
        
        return {
            badgeClasses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            numberClasses: 'bg-yellow-100 text-yellow-600 border-yellow-200',
            label: 'IN PROGRESS',
            icon: Circle
        };
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${statusInfo.numberClasses}`}>
                            {milestone.sequenceNumber || id}
                        </span>
                        {milestone.title}
                    </h1>
                    <p className="text-slate-500 mt-2 ml-11">
                        Milestone {milestone.sequenceNumber || id} of {milestones?.length || 0}
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.badgeClasses}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Description Card */}
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-bold text-sky-900 mb-2">Goal</h3>
                                {milestone.description ? (
                                    <div className="text-sky-800 leading-relaxed prose prose-sm max-w-none">
                                        <ReactMarkdown>{milestone.description}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sky-800 leading-relaxed">
                                        Complete this milestone to progress in your learning journey.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    {checklist.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                <h3 className="font-bold text-slate-700">Learning Objectives</h3>
                            </div>
                            <div className="p-6 space-y-2">
                                {checklist.map(item => (
                                    <ChecklistItem
                                        key={item.id}
                                        text={item.text}
                                        checked={item.checked}
                                        onToggle={() => toggleItem(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feedback Area */}
                    {feedback && (
                        <div className={`rounded-xl p-6 border flex gap-4 animate-in fade-in slide-in-from-bottom-2 ${feedback.type === 'error' ? 'bg-lavender-50 border-lavender-200' : 'bg-mint-50 border-mint-200'}`}>
                            <div className="mt-1">
                                {feedback.type === 'error' ? (
                                    <AlertCircle className="w-5 h-5 text-accent" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-mint-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold mb-1 ${feedback.type === 'error' ? 'text-accent' : 'text-mint-700'}`}>
                                    AI Feedback
                                </h4>
                                <div className="text-slate-700 text-sm prose prose-sm max-w-none">
                                    <ReactMarkdown>{feedback.message}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4">Actions</h3>

                        <button
                            onClick={handleCheckMilestone}
                            disabled={isChecking || milestone.completed}
                            className="w-full bg-mint-500 hover:bg-mint-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-mint-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mb-3 flex items-center justify-center gap-2"
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : milestone.completed ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Completed
                                </>
                            ) : (
                                "Check Milestone"
                            )}
                        </button>

                        <p className="text-xs text-center text-slate-400">
                            {repoUrl ? "We'll scan your repo for changes." : "Add a repository URL in settings first."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDetail;
