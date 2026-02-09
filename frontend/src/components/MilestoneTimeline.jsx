import React, { useState } from 'react';
import { Circle, Disc, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

const MilestoneItem = ({ id, title, status, isLast }) => {
    const navigate = useNavigate();

    // Status styles
    const styles = {
        COMPLETED: { icon: CheckCircle2, color: "text-mint-500", bg: "bg-mint-50", border: "border-mint-200" },
        IN_PROGRESS: { icon: Disc, color: "text-yellow-500 animate-pulse", bg: "bg-yellow-50", border: "border-yellow-200" },
        LOCKED: { icon: Lock, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" }
    }[status] || { icon: Circle, color: "text-slate-300", bg: "bg-slate-50", border: "border-slate-200" };

    const Icon = styles.icon;

    return (
        <div className="relative group pl-8 pb-8 last:pb-0">
            {/* Connector Line */}
            {!isLast && (
                <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-200 group-hover:bg-sky-200 transition-colors" />
            )}

            {/* Node */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 z-10 ${status === 'COMPLETED' ? 'border-mint-500' : status === 'IN_PROGRESS' ? 'border-yellow-400' : 'border-slate-300'}`}>
                <Icon className={`w-3.5 h-3.5 ${styles.color}`} />
            </div>

            {/* Card */}
            <div
                onClick={() => navigate(`/milestone/${id}`)}
                className={`flex items-center justify-between p-4 rounded-lg border ${styles.border} ${styles.bg} hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5`}
            >
                <span className={`font-semibold ${status === 'LOCKED' ? 'text-slate-500' : 'text-slate-800'}`}>
                    Milestone {id}: {title}
                </span>
                <div className="text-xs font-medium px-2 py-1 rounded bg-white/50 border border-black/5 text-slate-500">
                    {status.replace('_', ' ')}
                </div>
            </div>
        </div>
    );
};

const MilestoneTimeline = () => {
    const { milestones } = useAppStore();

    // If no milestones, show placeholder
    if (!milestones || milestones.length === 0) {
        return (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pl-1">Project Roadmap</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <p className="text-slate-500 text-center py-8">
                        Create a learning plan to see your roadmap
                    </p>
                </div>
            </div>
        );
    }

    // Map milestone data to display format
    const displayMilestones = milestones.map((m, index) => ({
        id: m.id,
        title: m.title,
        status: m.completed ? 'COMPLETED' : (index === 0 ? 'IN_PROGRESS' : 'LOCKED')
    }));

    return (
        <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 pl-1">Project Roadmap</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="max-w-3xl">
                    {displayMilestones.map((m, i) => (
                        <MilestoneItem
                            key={m.id}
                            {...m}
                            isLast={i === displayMilestones.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MilestoneTimeline;
