"use client";

import { useState } from "react";
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

  const generatePlaybook = () => {
    setLoading(true);
    setStep(5);

    // Simulate generation delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
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
          <div className="flex flex-col items-center justify-center animate-in fade-in duration-500 h-[60vh]">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-serif text-gray-900 mb-2">Generating your custom playbook...</h2>
            <p className="text-gray-500">Processing {tasks.length} tasks for {role}</p>
          </div>
        )}

        {step === 5 && !loading && (
          <Playbook
            role={role}
            tasks={tasks}
            elevenPm={elevenPm}
            desire={desire}
            onStartOver={() => {
              setStep(1);
            }}
          />
        )}
      </div>
    </main>
  );
}
