"use client";

import { useState } from "react";

interface Props {
    role: string;
    tasks: string[];
    setTasks: (tasks: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepWeekMirror({ role, tasks, setTasks, onNext, onBack }: Props) {
    const [inputValue, setInputValue] = useState("");

    const handleAddTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputValue.trim()) {
            setTasks([...tasks, inputValue.trim()]);
            setInputValue("");
        }
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-center mb-[3rem] w-full mt-4">
                <h2 className="text-[3rem] md:text-[4.5rem] font-medium mb-4 text-[#2C2C2C] tracking-tight font-serif leading-tight">
                    What does your week <br /> look like?
                </h2>
                <p className="text-[1.2rem] text-gray-500 font-sans tracking-normal mt-4">
                    Add a few tasks you spend the most time on as a {role || "professional"}.
                </p>
            </div>

            <div className="w-full max-w-xl bg-white p-8 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-12">
                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="e.g. Write weekly newsletter..."
                        className="flex-1 px-4 py-3 rounded-[8px] border border-gray-200 focus:outline-none focus:ring-[1.5px] focus:ring-orange-500 focus:border-transparent text-[15px] placeholder:text-gray-400 transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[14px]"
                    >
                        Add Task
                    </button>
                </form>

                <div className="flex flex-wrap gap-2">
                    {tasks.length === 0 && (
                        <p className="text-sm text-gray-400 italic w-full text-center py-4">No tasks added yet. Add at least one to continue.</p>
                    )}
                    {tasks.map((task, index) => (
                        <div
                            key={index}
                            className="group flex items-center gap-2 bg-[#f4f4f5] px-4 py-2.5 rounded-full text-[14px] text-gray-700 hover:bg-[#ebebec] transition-colors"
                        >
                            <span>{task}</span>
                            <button
                                onClick={() => removeTask(index)}
                                className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors ml-1"
                                aria-label="Remove task"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="px-6 py-[14px] rounded-[6px] font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={tasks.length === 0}
                    className={`px-7 py-[14px] rounded-[6px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2
            ${tasks.length > 0
                            ? "bg-[#2a2a2a] hover:bg-black text-white cursor-pointer shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
          `}
                >
                    Continue
                    <svg className={`w-5 h-5 ml-1 transform translate-y-[1px] ${tasks.length > 0 ? "text-white" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
