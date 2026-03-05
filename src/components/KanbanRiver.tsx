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

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function KanbanRiver({ userId, onComplete }: Props) {
    // --- STATE ---
    const [taskQueue, setTaskQueue] = useState([...PREDEFINED_TASKS, "CUSTOM"]);
    const [addedTasks, setAddedTasks] = useState<{ id: string; name: string; day?: Day }[]>([]);
    const [showDaysFor, setShowDaysFor] = useState<string | null>(null); // current task being assigned a day
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
            // Swipe Up -> Prompt Day Picker
            triggerDayPicker();
        } else if (offset.x > swipeThreshold) {
            // Swipe Right -> Add to Week
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
            triggerDayPicker();
        }
    };

    const triggerDayPicker = () => {
        if (isCustomMode && !customInput.trim()) return;
        setShowDaysFor(isCustomMode ? customInput.trim() : currentTask);
    };

    const assignDay = (day: Day) => {
        if (!showDaysFor) return;
        setAddedTasks((prev) => [...prev, { id: Date.now().toString(), name: showDaysFor, day }]);
        setTaskQueue((prev) => prev.slice(1));
        setShowDaysFor(null);
        if (isCustomMode) setCustomInput("");
    };

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            const dbTasks = addedTasks.map(t => t.day ? `${t.name} (${t.day})` : t.name);
            await updateDoc(doc(db, "users", userId), {
                weeklyTasks: dbTasks
            });
            onComplete();
        } catch (error) {
            console.error("Failed to save tasks", error);
            setIsSaving(false);
        }
    };


    // --- COMPUTED VISUALS ---
    const activeDays = new Set(addedTasks.filter(t => t.day).map(t => t.day));
    const progressPercent = Math.min((addedTasks.length / 5) * 100, 100);
    const canContinueEarly = addedTasks.length >= 5;

    return (
        <div className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-between overflow-hidden font-sans view-height overscroll-none">

            {/* Top Section */}
            <div className="w-full pt-16 px-6 flex flex-col items-center z-10">
                <h1 className="text-[2rem] md:text-[2.5rem] font-serif text-[#1C1917] tracking-tight mb-2 text-center">
                    What does your week look like?
                </h1>
                <p className="text-[17px] text-[#A8A29E] mb-8 font-light tracking-wide text-center">
                    Swipe through tasks. Add what fits your week.
                </p>

                {/* Day Pills */}
                <div className="flex gap-2 mb-4">
                    {DAYS.map((day) => {
                        const isActive = activeDays.has(day);
                        return (
                            <div
                                key={day}
                                className={`px-4 py-1.5 rounded-full text-sm transition-colors duration-500 font-medium tracking-wide
                  ${isActive ? "bg-[#D4622A] text-white shadow-sm" : "bg-[#F5F5F4] text-[#A8A29E]"}`}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Center - The River Cards */}
            <div className="flex-1 w-full flex items-center justify-center relative perspective-1000 z-20">
                <AnimatePresence mode="popLayout">
                    {currentTask && !showDaysFor && (
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
                                    Does this show up in your week?
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
                                        <Sparkles size={18} /> Add to my week
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

                    {/* Day Picker Overlay */}
                    {showDaysFor && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute z-40 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#F5F5F4] flex flex-col items-center"
                        >
                            <p className="text-[#A8A29E] text-sm mb-4 font-medium uppercase tracking-widest">Assign to a day</p>
                            <div className="flex gap-3">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => assignDay(day)}
                                        className="w-14 h-14 rounded-2xl bg-[#F5F5F4] text-[#1C1917] font-serif text-lg hover:bg-[#8FAF8F] hover:text-white transition-colors"
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowDaysFor(null)}
                                className="mt-6 text-[13px] text-[#A8A29E] hover:text-[#1C1917] transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}

                    {/* Completion State */}
                    {taskQueue.length === 0 && !showDaysFor && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center z-10"
                        >
                            <div className="w-20 h-20 mx-auto bg-[#D4622A]/10 rounded-full flex items-center justify-center mb-6">
                                <Sparkles className="text-[#D4622A]" size={32} />
                            </div>
                            <h2 className="text-2xl font-serif text-[#1C1917] mb-2">Great week.</h2>
                            <p className="text-[#A8A29E]">You&apos;ve mapped out {addedTasks.length} tasks.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Completion Button - Rises when >= 5 tasks */}
            <AnimatePresence>
                {(canContinueEarly || taskQueue.length === 0) && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute bottom-16 z-50 w-full flex justify-center"
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
                    ✦ {addedTasks.length} tasks added to your week
                </div>
            </div>

        </div>
    );
}
