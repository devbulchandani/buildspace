import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Lock, Info, AlertCircle, Circle } from 'lucide-react';
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
    const { milestones, updateMilestoneStatus } = useAppStore();
    const [checklist, setChecklist] = useState([
        { id: 1, text: "Understand Spring Data JPA", checked: true },
        { id: 2, text: "Create TaskRepository interface", checked: false },
        { id: 3, text: "Extend JpaRepository", checked: false },
    ]);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCheckMilestone = async () => {
        setIsChecking(true);
        setFeedback(null);

        try {
            const result = await verificationApi.verifyMilestone(id);

            setFeedback({
                type: result.completed ? 'success' : 'error',
                message: result.feedback
            });

            if (result.completed) {
                updateMilestoneStatus(parseInt(id), true);
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

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-sm border border-yellow-200">
                            {id}
                        </span>
                        Create Repository Layer
                    </h1>
                    <p className="text-slate-500 mt-2 ml-11">Milestone {id} of 5</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    IN PROGRESS
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Description Card */}
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-sky-900 mb-2">Goal</h3>
                                <p className="text-sky-800 leading-relaxed">
                                    You should create a <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 text-sky-700 font-mono text-sm">JpaRepository</code> for the Task entity. This will allow your application to communicate with the database without writing raw SQL.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-700">Tasks</h3>
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
                            <div>
                                <h4 className={`font-bold mb-1 ${feedback.type === 'error' ? 'text-accent' : 'text-mint-700'}`}>
                                    AI Feedback
                                </h4>
                                <p className="text-slate-700 text-sm">
                                    {feedback.message}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-4">Actions</h3>

                        <button
                            onClick={handleCheckMilestone}
                            disabled={isChecking}
                            className="w-full bg-mint-500 hover:bg-mint-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-mint-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed mb-3"
                        >
                            {isChecking ? "Verifying..." : "Check Milestone"}
                        </button>

                        <p className="text-xs text-center text-slate-400">
                            We'll scan your repo for changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDetail;
