import React from 'react';

export function LoboGuaraIcon({
  className = 'w-6 h-6 shrink-0',
  accentColor = '#FCE026',
}: {
  className?: string;
  accentColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Lobo-Guará Concept Digital"
    >
      {/* Silhueta Geométrica / Traços Finos do Lobo-Guará */}
      <path
        d="M24 44L14 34L17 25L24 31L31 25L34 34L24 44Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
      <path
        d="M24 31V16M24 31L20 23L24 16L28 23L24 31Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 18L11 4L22 13L17 25L14 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 18L37 4L26 13L31 25L34 18Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 13H26"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="19" cy="21" r="1.3" fill="currentColor" opacity="0.8" />
      <circle cx="29" cy="21" r="1.5" fill={accentColor} />
      <path
        d="M23 30.5H25"
        stroke={accentColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ConceptLogo({
  subtitle = 'Barbearia 777',
  className = '',
}: {
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0624C7] text-white shadow-md shadow-[#0624C7]/20 border border-white/10 shrink-0">
        <LoboGuaraIcon className="w-5 h-5" accentColor="#FCE026" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-sans font-black tracking-wider text-white text-sm uppercase leading-none">
            CONCEPT
          </span>
          <span className="font-sans font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#0624C7]/20 text-[#5373ff] border border-[#0624C7]/30 leading-none">
            CRM
          </span>
        </div>
        <span className="text-[10px] tracking-widest uppercase text-amber-400 font-semibold mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
