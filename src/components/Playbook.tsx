"use client";

import { useState } from "react";

interface Props {
    role: string;
    tasks: string[];
    elevenPm: string;
    desire: string;
    onStartOver: () => void;
}

export default function Playbook({ role, tasks, elevenPm, desire, onStartOver }: Props) {
    const [activeTab, setActiveTab] = useState<"overview" | "responses">("overview");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="w-full max-w-5xl flex flex-col items-center animate-in fade-in duration-500 py-12 px-4">

            {/* Playbook Header */}
            <div className="w-full flex items-center justify-between mb-8">
                <div>
                    <span className="font-bold text-[12px] tracking-[0.2em] font-mono text-gray-500 uppercase">
                        Your Custom Playbook
                    </span>
                    <h2 className="text-[2.5rem] font-serif font-medium text-gray-900 mt-2">
                        {role || "No Role Selected"}
                    </h2>
                </div>

                <button
                    onClick={onStartOver}
                    className="px-4 py-2 text-[14px] font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-[6px] hover:bg-gray-50 transition-colors"
                >
                    Start Over
                </button>
            </div>

            <div className="w-full bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`py-4 px-2 mr-6 text-[15px] font-medium relative transition-colors
              ${activeTab === "overview" ? "text-orange-600" : "text-gray-500 hover:text-gray-800"}`}
                    >
                        Overview & Tasks
                        {activeTab === "overview" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("responses")}
                        className={`py-4 px-2 text-[15px] font-medium relative transition-colors
              ${activeTab === "responses" ? "text-orange-600" : "text-gray-500 hover:text-gray-800"}`}
                    >
                        Deep Dive Responses
                        {activeTab === "responses" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === "overview" && (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                                    Key Tasks to Optimize
                                </h3>
                                {tasks.length === 0 ? (
                                    <p className="text-gray-400 italic">No tasks provided.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tasks.map((task, index) => (
                                            <div key={index} className="group p-5 bg-[#fcfcfc] border border-gray-100 rounded-[8px] flex justify-between items-start hover:border-gray-200 transition-colors">
                                                <p className="text-gray-800 text-[15px] leading-relaxed pr-4">
                                                    {task}
                                                </p>
                                                <button
                                                    onClick={() => handleCopy(task, index)}
                                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Copy task"
                                                >
                                                    {copiedIndex === index ? (
                                                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "responses" && (
                        <div className="space-y-8 animate-in fade-in">
                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                    The 11 PM Bottleneck
                                </h3>
                                <div className="p-6 bg-[#f8fafd] border border-blue-100 rounded-[8px] relative group">
                                    <p className="text-gray-800 text-[16px] leading-relaxed whitespace-pre-wrap font-serif">
                                        {elevenPm || "No answer provided."}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(elevenPm, 998)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 p-2 rounded-md hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {copiedIndex === 998 ? "Copied!" : "Copy text"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                    The Magic Wand Protocol
                                </h3>
                                <div className="p-6 bg-[#faqfdf8] bg-green-50/30 border border-green-100 rounded-[8px] relative group">
                                    <p className="text-gray-800 text-[16px] leading-relaxed whitespace-pre-wrap font-serif">
                                        {desire || "No answer provided."}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(desire, 999)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-green-600 p-2 rounded-md hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        {copiedIndex === 999 ? "Copied!" : "Copy text"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
