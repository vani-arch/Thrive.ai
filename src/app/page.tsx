"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepOnboarding from "@/components/StepOnboarding";

export default function Home() {
  const [role, setRole] = useState("");
  const router = useRouter();

  const handleNext = () => {
    if (role) {
      router.push(`/signup?role=${encodeURIComponent(role)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f9f9f9] relative">
      <div className="w-full max-w-6xl flex justify-start absolute top-8 left-8">
        <span className="font-bold text-[11px] tracking-[0.25em] font-mono text-gray-800">
          THRIVE.AI
        </span>
      </div>

      <div className="w-full flex justify-center mt-12 mb-8">
        <StepOnboarding
          role={role}
          setRole={setRole}
          onNext={handleNext}
        />
      </div>
    </main>
  );
}
