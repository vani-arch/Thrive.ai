"use client";

export type Role = 'Marketing Manager' | 'Content Manager' | 'Product Manager' | 'Chief of Staff' | 'HR & L&D';

const roles: {
    title: Role;
    description: string;
    borderColorClass: string;
}[] = [
        {
            title: "Marketing Manager",
            description: "Optimize campaigns and creative strategy.",
            borderColorClass: "bg-orange-500",
        },
        {
            title: "Content Manager",
            description: "Scale production and editorial quality.",
            borderColorClass: "bg-[#2563eb]",
        },
        {
            title: "Product Manager",
            description: "Ship faster with automated requirements.",
            borderColorClass: "bg-[#059669]",
        },
        {
            title: "Chief of Staff",
            description: "Maximize executive output and operations.",
            borderColorClass: "bg-[#2b6cb0]",
        },
        {
            title: "HR & L&D",
            description: "Transform talent growth and onboarding.",
            borderColorClass: "bg-[#38a169]",
        },
    ];

interface Props {
    role: string;
    setRole: (r: string) => void;
    onNext: () => void;
}

export default function StepOnboarding({ role, setRole, onNext }: Props) {
    return (
        <div className="w-full max-w-6xl flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-center mb-[4.5rem] w-full mt-4">
                <h1 className="text-[4rem] md:text-[5.5rem] font-medium mb-4 text-[#2C2C2C] tracking-tight font-serif">
                    Do your best work.
                </h1>
                <p className="text-[1.3rem] text-gray-500 font-sans tracking-normal">
                    Find out exactly where AI fits in your job &mdash; in 5 minutes.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-[0.8rem] w-full mb-16 max-w-5xl">
                {roles.map((r) => {
                    const isSelected = role === r.title;
                    return (
                        <button
                            key={r.title}
                            onClick={() => setRole(r.title)}
                            className={`
                relative flex flex-col justify-start text-left p-6 pt-5 pb-7
                bg-white rounded-[10px] transition-all duration-200 ease-in-out border overflow-hidden
                w-full sm:w-[calc(50%-0.4rem)] md:w-[190px] h-[120px] 
                ${isSelected
                                    ? "border-orange-500 shadow-[0_4px_12px_rgba(0,0,0,0.06)] ring-0"
                                    : "border-transparent shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-[1px]"
                                } 
                outline-none
              `}
                        >
                            <div
                                className={`absolute left-0 top-1/2 -translate-y-1/2 h-[75%] w-[3px] rounded-r-lg ${r.borderColorClass}`}
                            />

                            <h3 className="font-bold text-[#1a1a1a] text-[13px] mb-[6px] ml-1 leading-snug">
                                {r.title}
                            </h3>
                            <p className="text-[11px] text-gray-500 ml-1 leading-[1.4] pr-1">
                                {r.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={onNext}
                disabled={!role}
                className={`px-7 py-[14px] rounded-[6px] font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 mt-4
          ${role
                        ? "bg-[#2a2a2a] hover:bg-black text-white cursor-pointer shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
        `}
            >
                Build my playbook
                <svg className={`w-5 h-5 ml-1 transform translate-y-[1px] ${role ? "text-white" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>
    );
}
