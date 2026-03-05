"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push("/login"); // Redirect to login if unauthenticated
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null; // Will redirect via useEffect

    return (
        <main className="min-h-screen bg-[#f9f9f9] p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <span className="font-bold text-[12px] tracking-[0.25em] font-mono text-gray-800 uppercase">
                        THRIVE.AI
                    </span>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">
                            {user.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 rounded-[8px] hover:bg-white transition-all shadow-sm hover:shadow"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Welcome Banner */}
                <div className="bg-white p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 mb-8 flex flex-col items-center text-center">
                    <h1 className="text-[3rem] font-serif text-gray-900 mb-3 text-balance">
                        Welcome to your Dashboard
                    </h1>
                    <p className="text-[1.1rem] text-gray-500 mb-0 max-w-2xl">
                        You are successfully authenticated. From here, you can generate new playbooks or view your system history.
                    </p>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/onboarding" className="group block p-8 border border-gray-200 rounded-2xl hover:border-orange-200 hover:shadow-md transition-all bg-white overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Generate Playbook</h2>
                        <p className="text-gray-500 text-[15px] leading-relaxed">Design a new automated work week using the Eliminate, Automate, Own framework. Identify your bottlenecks and let AI build your protocol.</p>
                        <div className="mt-6 flex items-center text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                            Start Workflow <span className="ml-1">→</span>
                        </div>
                    </Link>

                    <div className="p-8 border border-gray-200 rounded-2xl bg-gray-50/50">
                        <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-2xl font-serif text-gray-400">Playbook History</h2>
                            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">COMING SOON</span>
                        </div>
                        <p className="text-gray-400 text-[15px] leading-relaxed">View your previously generated workflows, edit your existing Handover Protocols, and track your time savings over the quarter.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
