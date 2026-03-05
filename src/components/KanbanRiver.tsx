"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface Props {
    userId: string;
    onComplete: () => void;
}

const PREDEFINED_TASKS = [
    "Weekly team standup",
    "Respond to emails and messages",
    "Review campaign performance",
    "Write content or copy",
    "Brief the design or creative team",
    "Prepare reports or decks",
    "Client or stakeholder meetings",
    "Review and approve team work",
    "Research and competitor analysis",
    "Update project trackers or tools",
    "Planning and strategy sessions",
];

type TimeSlot = "Morning" | "Afternoon" | "Evening";
const TIMES: TimeSlot[] = ["Morning", "Afternoon", "Evening"];

export default function KanbanRiver({ userId, onComplete }: Props) {
    // --- STATE ---
    const [taskQueue, setTaskQueue] = useState([...PREDEFINED_TASKS, "CUSTOM"]);
    const [addedTasks, setAddedTasks] = useState<{ id: string; name: string; time?: TimeSlot }[]>([]);
    const [showTimeFor, setShowTimeFor] = useState<string | null>(null); // current task being assigned a time
    const [customInput, setCustomInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const currentTask = taskQueue[0] || null;
    const isCustomMode = currentTask === "CUSTOM";

    // --- DRAG PHYSICS ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Tinder-style rotation and opacity based on X and Y drag
    const rotate = useTransform(x, [-200, 200], [-8, 8]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Highlight border glow when dragging right (add) or left (skip) or up (add to day)
    const glow = useTransform(x, [-100, 0, 100], ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(212, 98, 42, 0.4)"]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 100;
        const { offset } = info;

        if (offset.y < -swipeThreshold && Math.abs(offset.x) < swipeThreshold) {
            // Swipe Up -> Prompt Time Picker
            triggerTimePicker();
        } else if (offset.x > swipeThreshold) {
            // Swipe Right -> Add to Day
            handleAction("ADD");
        } else if (offset.x < -swipeThreshold) {
            // Swipe Left -> Skip
            handleAction("SKIP");
        }
    };

    // --- ACTIONS ---
    const handleAction = (type: "SKIP" | "ADD" | "ADD_TO_DAY") => {
        if (!currentTask) return;
        if (isCustomMode && type !== 'SKIP' && !customInput.trim()) return;

        const taskName = isCustomMode ? customInput.trim() : currentTask;

        if (type === "SKIP") {
            setTaskQueue((prev) => prev.slice(1));
        } else if (type === "ADD") {
            setAddedTasks((prev) => [...prev, { id: Date.now().toString(), name: taskName }]);
            setTaskQueue((prev) => prev.slice(1));
            if (isCustomMode) setCustomInput("");
        } else if (type === "ADD_TO_DAY") {
            triggerTimePicker();
        }
    };

    const triggerTimePicker = () => {
        if (isCustomMode && !customInput.trim()) return;
        setShowTimeFor(isCustomMode ? customInput.trim() : currentTask);
    };

    const assignTime = (time: TimeSlot) => {
        if (!showTimeFor) return;
        setAddedTasks((prev) => [...prev, { id: Date.now().toString(), name: showTimeFor, time }]);
        setTaskQueue((prev) => prev.slice(1));
        setShowTimeFor(null);
        if (isCustomMode) setCustomInput("");
    };

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            const dbTasks = addedTasks.map(t => t.time ? `${t.name} (${t.time})` : t.name);
            await updateDoc(doc(db, "users", userId), {
                weeklyTasks: dbTasks
            });
            onComplete();
        } catch (error) {
            console.error("Failed to save tasks", error);
            setIsSaving(false);
        }
    };


    const progressPercent = Math.min((addedTasks.length / 5) * 100, 100);
    const canContinueEarly = addedTasks.length >= 5;

    return (
        <div className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-between overflow-hidden font-sans view-height overscroll-none">

            {/* Top Section - The Board */}
            <div className="w-full h-[55vh] pt-12 px-6 flex flex-col z-10 overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center mb-8 shrink-0">
                    <h1 className="text-[2rem] md:text-[2.5rem] font-serif text-[#1C1917] tracking-tight mb-2 text-center">
                        What does your day look like?
                    </h1>
                    <p className="text-[17px] text-[#A8A29E] font-light tracking-wide text-center">
                        Swipe to add. Tap to remove.
                    </p>
                </div>

                {/* Day Columns / Rows */}
                <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pb-8 shrink-0">
                    {TIMES.map((time) => {
                        const timeTasks = addedTasks.filter(t => t.time === time);
                        const hasTasks = timeTasks.length > 0;

                        return (
                            <div key={time} className="flex flex-col">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-colors
                                        ${hasTasks ? "bg-[#D4622A] text-white" : "bg-[#F5F5F4] text-[#A8A29E]"}`}
                                    >
                                        {time}
                                    </div>
                                    {!hasTasks && <div className="h-[1px] flex-1 bg-[#F5F5F4]"></div>}
                                </div>

                                <AnimatePresence>
                                    {timeTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                            exit={{ opacity: 0, height: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className="group flex items-center justify-between py-2.5 px-3 mb-1.5 -ml-3 rounded-xl hover:bg-[#F5F5F4]/50 transition-colors"
                                        >
                                            <span className="text-[15px] text-[#1C1917] font-medium leading-snug">
                                                {task.name}
                                            </span>
                                            <button
                                                onClick={() => setAddedTasks(prev => prev.filter(t => t.id !== task.id))}
                                                className="text-[#A8A29E] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 p-1.5 rounded-md transition-all flex-shrink-0"
                                                title="Remove task"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="h-2"></div>
                            </div>
                        );
                    })}

                    {/* Unassigned Tasks (Added to 'My Day' but no specific day) */}
                    {addedTasks.filter(t => !t.time).length > 0 && (
                        <div className="flex flex-col mt-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#8FAF8F] text-white">
                                    Anytime
                                </div>
                            </div>
                            <AnimatePresence>
                                {addedTasks.filter(t => !t.time).map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className="group flex items-center justify-between py-2.5 px-3 mb-1.5 -ml-3 rounded-xl hover:bg-[#F5F5F4]/50 transition-colors"
                                    >
                                        <span className="text-[15px] text-[#1C1917] font-medium leading-snug">
                                            {task.name}
                                        </span>
                                        <button
                                            onClick={() => setAddedTasks(prev => prev.filter(t => t.id !== task.id))}
                                            className="text-[#A8A29E] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 p-1.5 rounded-md transition-all flex-shrink-0"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Half - The River Cards (Tinder Swipe) */}
            <div className="h-[45vh] w-full flex items-center justify-center relative perspective-1000 z-20 pb-12">
                <AnimatePresence mode="popLayout">
                    {currentTask && !showTimeFor && (
                        <motion.div
                            key={currentTask}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            style={{ x, y, rotate, opacity }}
                            onDragEnd={handleDragEnd}
                            initial={{ y: 200, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="absolute z-30 cursor-grab active:cursor-grabbing pb-8"
                        >
                            {/* Card Body */}
                            <motion.div
                                className="w-[320px] md:w-[380px] bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F5F5F4] flex flex-col items-center text-center relative overflow-hidden"
                                style={{ boxShadow: glow }}
                            >
                                {isCustomMode ? (
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="Something else? Type it here"
                                            className="w-full text-[1.4rem] font-serif text-[#1C1917] text-center focus:outline-none placeholder:text-[#D6D3D1] mb-2 bg-transparent border-b border-dashed border-[#E7E5E4] pb-2"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h2 className="text-[1.4rem] font-serif text-[#1C1917] leading-snug mb-3">
                                        {currentTask}
                                    </h2>
                                )}
                                <p className="text-[15px] text-[#A8A29E] font-light">
                                    Does this show up in your day?
                                </p>

                                {/* Card Action Buttons */}
                                <div className="flex items-center justify-between w-full mt-8 pt-6 border-t border-[#F5F5F4]">
                                    <button
                                        onClick={() => handleAction('SKIP')}
                                        className="p-3 text-[#A8A29E] hover:bg-[#F5F5F4] rounded-full transition-colors"
                                    >
                                        <X size={24} strokeWidth={1.5} />
                                    </button>
                                    <button
                                        onClick={() => handleAction('ADD')}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D4622A] text-white rounded-full font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all"
                                    >
                                        <Sparkles size={18} /> Add to my day
                                    </button>
                                    <button
                                        onClick={() => handleAction('ADD_TO_DAY')}
                                        className="p-3 text-[#8FAF8F] hover:bg-[#F5F5F4] rounded-full transition-colors"
                                    >
                                        <ArrowRight size={24} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Time Picker Overlay */}
                    {showTimeFor && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute z-40 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#F5F5F4] flex flex-col items-center"
                        >
                            <p className="text-[#A8A29E] text-sm mb-4 font-medium uppercase tracking-widest">Assign to a time</p>
                            <div className="flex gap-3">
                                {TIMES.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => assignTime(time)}
                                        className="px-6 py-3 rounded-2xl bg-[#F5F5F4] text-[#1C1917] font-serif hover:bg-[#8FAF8F] hover:text-white transition-colors"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowTimeFor(null)}
                                className="mt-6 text-[13px] text-[#A8A29E] hover:text-[#1C1917] transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}

                    {/* Completion State */}
                    {taskQueue.length === 0 && !showTimeFor && addedTasks.length >= 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center z-10"
                        >
                            <div className="w-16 h-16 mx-auto bg-[#D4622A]/10 rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="text-[#D4622A]" size={24} />
                            </div>
                            <h2 className="text-xl font-serif text-[#1C1917] mb-1">Great day.</h2>
                            <p className="text-sm text-[#A8A29E]">Ready to build your playbook.</p>
                        </motion.div>
                    )}

                    {/* Empty State warning if they swiped skip on everything */}
                    {taskQueue.length === 0 && !showTimeFor && addedTasks.length < 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center z-10 bg-white p-6 rounded-3xl shadow-sm border border-orange-100 max-w-sm"
                        >
                            <h2 className="text-lg font-serif text-orange-600 mb-2">Almost there!</h2>
                            <p className="text-sm text-[#A8A29E] mb-4">Please add at least 5 tasks to build a high-quality playbook.</p>
                            <button
                                onClick={() => setTaskQueue(["CUSTOM"])}
                                className="px-6 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-100 transition-colors"
                            >
                                + Add custom task
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Completion Button - Rises when >= 5 tasks AND queue is empty so it doesn't block swipes early */}
            <AnimatePresence>
                {(canContinueEarly && taskQueue.length === 0) && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute bottom-12 z-50 w-full flex justify-center"
                    >
                        <button
                            onClick={handleFinish}
                            disabled={isSaving}
                            className="bg-white text-[#D4622A] px-10 py-4 rounded-full font-serif text-[1.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#F5F5F4]/50 hover:scale-105 transition-transform flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Build my playbook →"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom River */}
            <div className="w-full absolute bottom-0 left-0 bg-[#E7E5E4] h-1.5 z-40">
                <motion.div
                    className="h-full bg-[#D4622A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[13px] text-[#A8A29E] whitespace-nowrap pb-2 font-medium">
                    ✦ {addedTasks.length} tasks added to your day
                </div>
            </div>

        </div>
    );
}
