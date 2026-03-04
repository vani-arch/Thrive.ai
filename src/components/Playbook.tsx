"use client";

import { useState } from "react";

interface PlaybookTask {
    name: string;
    category: string;
    humanMins: number;
    aiMins: number;
    depth?: string;
    handover?: {
        who?: string;
        steps?: string[];
        timeline?: string;
        monitor?: string;
    };
    promptChain?: any;
    aiAssist?: string;
    checkpoint?: string;
    tenX?: string;
}

interface PlaybookData {
    hoursReclaimed: number;
    desireEcho: string;
    tasks: PlaybookTask[];
}

interface Props {
    role: string;
    playbookData: PlaybookData | null;
    onStartOver: () => void;
}

type TabType = "ELIMINATE" | "AUTOMATE" | "OWN";

export default function Playbook({ role, playbookData, onStartOver }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>("AUTOMATE");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (!playbookData || !playbookData.tasks) {
        return (
            <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-500 min-h-[50vh]">
                <h2 className="text-2xl font-serif text-gray-800 mb-6">Something went wrong. Please try again.</h2>
                <button
                    onClick={onStartOver}
                    className="px-6 py-3 bg-gray-900 text-white rounded-[6px] hover:bg-black transition-colors"
                >
                    Start Over
                </button>
            </div>
        );
    }

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getVisibleTasks = () => {
        if (!playbookData?.tasks) return [];
        return playbookData.tasks.filter(
            (t) => t.category?.toUpperCase() === activeTab
        );
    };

    const visibleTasks = getVisibleTasks();

    const renderPromptChain = (chain: any) => {
        if (!chain) return null;
        if (Array.isArray(chain)) {
            return chain.map((step, i) => (
                <li key={i} className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900 mr-2">Step {i + 1}:</span>
                    {step}
                </li>
            ));
        } else if (typeof chain === "object") {
            return Object.entries(chain).map(([key, value], i) => (
                <li key={i} className="mb-2 text-sm text-gray-700">
                    <span className="font-semibold text-gray-900 mr-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    {String(value)}
                </li>
            ));
        }
        return <p className="text-sm text-gray-700">{String(chain)}</p>;
    };

    return (
        <div className="w-full max-w-5xl flex flex-col items-center animate-in fade-in duration-500 py-12 px-4">
            {/* Header section with hours reclaimed */}
            <div className="w-full flex items-start justify-between mb-8">
                <div>
                    <span className="font-bold text-[12px] tracking-[0.2em] font-mono text-gray-500 uppercase">
                        Your Custom Playbook
                    </span>
                    <h2 className="text-[2.5rem] font-serif font-medium text-gray-900 mt-2">
                        {role || "No Role Selected"}
                    </h2>
                    {playbookData?.desireEcho && (
                        <p className="text-gray-600 mt-2 max-w-2xl text-[15px] italic border-l-2 border-orange-200 pl-4 py-1">
                            "{playbookData.desireEcho}"
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-end gap-4">
                    <button
                        onClick={onStartOver}
                        className="px-4 py-2 text-[14px] font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-[6px] hover:bg-gray-50 transition-colors"
                    >
                        Start Over
                    </button>
                    {playbookData?.hoursReclaimed && (
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex flex-col items-center">
                            <span className="text-[2rem] font-bold leading-none mb-1">
                                {playbookData.hoursReclaimed}
                            </span>
                            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                                Hours Reclaimed
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden min-h-[400px]">
                {/* Framework Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    {(["ELIMINATE", "AUTOMATE", "OWN"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-2 mr-6 text-[14px] font-bold tracking-wider relative transition-colors uppercase
                ${activeTab === tab
                                    ? "text-orange-600"
                                    : "text-gray-400 hover:text-gray-800"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 bg-gray-50/30">
                    <div className="space-y-6 animate-in fade-in">
                        {visibleTasks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 italic">
                                No tasks classified under {activeTab} for this workflow.
                            </div>
                        ) : (
                            visibleTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative"
                                >
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                                        <h3 className="text-[18px] font-semibold text-gray-900 font-serif pr-8">
                                            {task.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-red-500 font-medium whitespace-nowrap">
                                                Human: {task.humanMins}m
                                            </span>
                                            <span className="text-blue-500 font-medium whitespace-nowrap">
                                                AI: {task.aiMins || 0}m
                                            </span>
                                        </div>
                                    </div>

                                    {activeTab === "ELIMINATE" && task.handover && (
                                        <div className="space-y-4">
                                            <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                                                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                                                    Handover Protocol
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">To Who:</span>
                                                        <span className="font-semibold">{task.handover.who || "N/A"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 block mb-1">Timeline:</span>
                                                        <span className="font-semibold">{task.handover.timeline || "N/A"}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500 block mb-1">Steps:</span>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {task.handover.steps && Array.isArray(task.handover.steps)
                                                                ? task.handover.steps.map((s, i) => <li key={i}>{s}</li>)
                                                                : <li>{String(task.handover.steps || "N/A")}</li>}
                                                        </ul>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500 block mb-1">Monitor:</span>
                                                        <span className="italic">{task.handover.monitor || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "AUTOMATE" && (
                                        <div className="space-y-4">
                                            {task.promptChain && (
                                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex justify-between items-center">
                                                        Prompt Chain
                                                        <button
                                                            onClick={() => handleCopy(JSON.stringify(task.promptChain, null, 2), index)}
                                                            className="text-blue-600 hover:text-blue-800 normal-case tracking-normal font-medium flex items-center gap-1"
                                                        >
                                                            {copiedIndex === index ? "Copied!" : "Copy Chain"}
                                                        </button>
                                                    </h4>
                                                    <ul className="pl-2">
                                                        {renderPromptChain(task.promptChain)}
                                                    </ul>
                                                </div>
                                            )}
                                            {task.checkpoint && (
                                                <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                                                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                                                        Human Checkpoint
                                                    </h4>
                                                    <p className="text-sm text-gray-800">{task.checkpoint}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "OWN" && (
                                        <div className="space-y-4">
                                            {task.aiAssist && (
                                                <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                                                        AI Assist Layer
                                                    </h4>
                                                    <p className="text-sm text-gray-800">{task.aiAssist}</p>
                                                </div>
                                            )}
                                            {task.checkpoint && (
                                                <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                                                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">
                                                        Judgment Checkpoint
                                                    </h4>
                                                    <p className="text-sm text-gray-800">{task.checkpoint}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {task.tenX && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <p className="text-xs text-gray-500 italic">
                                                <span className="font-semibold text-indigo-600 uppercase not-italic mr-2">10X Strategy:</span>
                                                {task.tenX}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
