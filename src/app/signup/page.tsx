"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user profile to Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                role,
                createdAt: serverTimestamp()
            });

            // Redirect to onboarding (index)
            router.push("/");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#f9f9f9] p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
                <div className="flex justify-center mb-8">
                    <span className="font-bold text-[11px] tracking-[0.25em] font-mono text-gray-800 uppercase">
                        THRIVE.AI
                    </span>
                </div>
                <h1 className="text-[2rem] font-serif text-gray-900 mb-6 text-center">Create Account</h1>
                {error && <p className="text-red-500 text-sm mb-6 text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-gray-900 bg-gray-50/50 focus:bg-white"
                            required
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-gray-900 bg-gray-50/50 focus:bg-white"
                            required
                            placeholder="you@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">Professional Role</label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-gray-900 bg-gray-50/50 focus:bg-white"
                            required
                            placeholder="e.g. Marketing Manager"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 tracking-wide">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-gray-900 bg-gray-50/50 focus:bg-white"
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-[8px] font-semibold hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px] disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:translate-y-0 disabled:shadow-none mt-2"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-500">
                    Already have an account? <Link href="/login" className="text-orange-600 font-bold hover:underline">Log In</Link>
                </p>
            </div>
        </main>
    );
}
