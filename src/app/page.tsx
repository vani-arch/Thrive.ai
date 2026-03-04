"use client";

import { useState, useEffect } from "react";
import StepOnboarding from "@/components/StepOnboarding";
import StepWeekMirror from "@/components/StepWeekMirror";
import StepElevenPm from "@/components/StepElevenPm";
import StepDesire from "@/components/StepDesire";
import Playbook from "@/components/Playbook";

export default function Home() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [elevenPm, setElevenPm] = useState("");
  const [desire, setDesire] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [playbookData, setPlaybookData] = useState<any>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingPhase((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const generatePlaybook = async () => {
    setLoading(true);
    setStep(5);
    setLoadingPhase(0);

    try {
      const res = await fetch("/api/generate-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, tasks, elevenPm, desire })
      });

      console.log('API status:', res.status);
      const rawText = await res.text();
      console.log('Raw API Response text:', rawText);

      const data = JSON.parse(rawText);
      console.log("Parsed Playbook API Response:", data);
      setPlaybookData(data);
    } catch (error) {
      console.error("Failed to generate playbook", error);
    } finally {
      setLoading(false);
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
        {step === 1 && (
          <StepOnboarding
            role={role}
            setRole={setRole}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepWeekMirror
            role={role}
            tasks={tasks}
            setTasks={setTasks}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepElevenPm
            role={role}
            elevenPm={elevenPm}
            setElevenPm={setElevenPm}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepDesire
            desire={desire}
            setDesire={setDesire}
            onNext={generatePlaybook}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && loading && (
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

        {step === 5 && !loading && (
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
