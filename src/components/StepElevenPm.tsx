"use client";

interface Props {
    role: string;
    elevenPm: string;
    setElevenPm: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepElevenPm({ role, elevenPm, setElevenPm, onNext, onBack }: Props) {
    const maxLength = 500;

    return (
        <div className="w-full max-w-4xl flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-center mb-[3rem] w-full mt-4">
                <h2 className="text-[3rem] md:text-[4.5rem] font-medium mb-4 text-[#2C2C2C] tracking-tight font-serif leading-tight">
                    It&apos;s 11 PM.
                </h2>
                <p className="text-[1.2rem] text-gray-500 font-sans tracking-normal mt-2 max-w-2xl mx-auto">
                    As a {role || "professional"}, what&apos;s the one task keeping you up at night? The thing you dread doing manually every week.
                </p>
            </div>

            <div className="w-full max-w-2xl bg-white p-8 rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 mb-12 relative">
                <textarea
                    value={elevenPm}
                    onChange={(e) => setElevenPm(e.target.value.slice(0, maxLength))}
                    placeholder="I spend 4 hours every Friday manually collating reports from 3 different sources..."
                    className="w-full min-h-[150px] p-4 text-[16px] leading-relaxed text-gray-700 bg-transparent resize-y focus:outline-none placeholder:text-gray-300"
                    autoFocus
                />

                <div className="absolute bottom-4 right-6 text-[12px] font-medium text-gray-400">
                    <span className={elevenPm.length >= maxLength ? "text-orange-500" : ""}>
                        {elevenPm.length}
                    </span>
                    {" / "}{maxLength}
                </div>

                {/* Subtle bottom border highlight */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gray-100 to-transparent transition-opacity" />
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-opacity duration-300 ${elevenPm.length > 0 ? 'opacity-100' : 'opacity-0'}`} />
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
                    disabled={elevenPm.trim().length === 0}
                    className={`px-7 py-[14px] rounded-[6px] font-semibold text-[15px] transition-all flex items-center justify-center gap-2
            ${elevenPm.trim().length > 0
                            ? "bg-[#2a2a2a] hover:bg-black text-white cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-[1px]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }
          `}
                >
                    Continue
                    <svg className={`w-5 h-5 ml-1 transform translate-y-[1px] ${elevenPm.trim().length > 0 ? "text-white" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
