"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import KanbanRiver from "@/components/KanbanRiver";
import StepElevenPm from "@/components/StepElevenPm";
import StepDesire from "@/components/StepDesire";
import Playbook, { PlaybookData } from "@/components/Playbook";

export default function OnboardingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [step, setStep] = useState(1); // 1: KanbanRiver, 2: ElevenPm, 3: Desire, 4: Generating/Playbook
    const [role, setRole] = useState("");
    const [elevenPm, setElevenPm] = useState("");
    const [desire, setDesire] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [playbookData, setPlaybookData] = useState<PlaybookData | null>(null);

    const router = useRouter();

    // Authentication & Role Fetching
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch user's role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setRole(data.role || "Professional");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                }
            } else {
                router.push("/login");
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    // Loading animation phase
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingPhase((prev) => (prev < 2 ? prev + 1 : prev));
        }, 2500);
        return () => clearInterval(interval);
    }, [loading]);

    const generatePlaybook = async () => {
        setLoading(true);
        setStep(4);
        setLoadingPhase(0);

        try {
            // Temporarily passing empty tasks array to satisfy backend signature before full backend refactor
            const res = await fetch("/api/generate-playbook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, tasks: [], elevenPm, desire })
            });

            const rawText = await res.text();
            const data = JSON.parse(rawText);
            setPlaybookData(data);
        } catch (error) {
            console.error("Failed to generate playbook", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null; // Wait for redirect

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f9f9f9] relative">
            <div className="w-full max-w-6xl flex justify-between absolute top-8 px-8 items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
                <span className="font-bold text-[11px] tracking-[0.25em] font-mono text-gray-800">
                    THRIVE.AI
                </span>
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider hover:text-gray-800 transition-colors">
                    Exit to Dashboard
                </span>
            </div>

            <div className="w-full flex justify-center mt-12 mb-8">
                {step === 1 && user && (
                    <KanbanRiver
                        userId={user.uid}
                        onComplete={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <StepElevenPm
                        role={role}
                        elevenPm={elevenPm}
                        setElevenPm={setElevenPm}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <StepDesire
                        desire={desire}
                        setDesire={setDesire}
                        onNext={generatePlaybook}
                        onBack={() => setStep(2)}
                    />
                )}

                {step === 4 && loading && (
                    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 min-h-[50vh] bg-[#FAFAF8] w-full rounded-2xl shadow-sm border border-gray-100 p-8 text-center ring-1 ring-black/5">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-8"></div>
                        <div className="h-8 relative w-full flex justify-center items-center">
                            {loadingPhase === 0 && (
                                <p className="text-xl font-serif text-gray-800 animate-in fade-in slide-in-from-bottom-2 absolute">
                                    Mapping your workflow...
                                </p>
                            )}
                            {loadingPhase === 1 && (
                                <p className="text-xl font-serif text-gray-800 animate-in fade-in slide-in-from-bottom-2 absolute">
                                    Identifying where AI fits...
                                </p>
                            )}
                            {loadingPhase === 2 && (
                                <p className="text-xl font-serif text-gray-800 animate-in fade-in slide-in-from-bottom-2 absolute">
                                    Building your Human Checkpoints...
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {step === 4 && !loading && (
                    <Playbook
                        role={role}
                        playbookData={playbookData}
                        onStartOver={() => {
                            setStep(1);
                            setPlaybookData(null);
                        }}
                    />
                )}
            </div>
        </main>
    );
}
