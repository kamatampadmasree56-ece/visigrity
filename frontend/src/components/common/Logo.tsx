import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const VisigrityLogo: React.FC<LogoProps> = ({ size = 40, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="VISIGRITY Logo"
      >
        {/* Shield base */}
        <path
          d="M50 8 L88 24 L88 50 C88 71 70 87 50 95 C30 87 12 71 12 50 L12 24 Z"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Shield inner glow fill */}
        <path
          d="M50 14 L82 28 L82 50 C82 68 66 82 50 90 C34 82 18 68 18 50 L18 28 Z"
          fill="rgba(56,189,248,0.05)"
        />

        {/* Eye outline - lens */}
        <ellipse cx="50" cy="50" rx="22" ry="16" fill="none" stroke="#60A5FA" strokeWidth="2" />

        {/* Lens edge highlights */}
        <path d="M28 50 Q39 36 50 34 Q61 36 72 50" stroke="#38BDF8" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Iris circle */}
        <circle cx="50" cy="50" r="9" fill="none" stroke="#38BDF8" strokeWidth="2" />

        {/* Pupil */}
        <circle cx="50" cy="50" r="4.5" fill="#38BDF8" />

        {/* Digital fingerprint arcs - left side */}
        <path d="M29 50 A21 16 0 0 1 35 39" stroke="#38BDF8" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="2 2" />
        <path d="M26 50 A24 18 0 0 1 33 37" stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="2 3" />

        {/* Digital fingerprint arcs - right side */}
        <path d="M71 50 A21 16 0 0 0 65 39" stroke="#38BDF8" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="2 2" />
        <path d="M74 50 A24 18 0 0 0 67 37" stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="2 3" />

        {/* Verification check mark - overlaid bottom */}
        <path
          d="M38 68 L46 76 L64 58"
          stroke="#22C55E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Connected nodes - top corners inside shield */}
        <circle cx="32" cy="30" r="2.5" fill="#38BDF8" opacity="0.6" />
        <circle cx="68" cy="30" r="2.5" fill="#38BDF8" opacity="0.6" />
        <circle cx="50" cy="20" r="2.5" fill="#60A5FA" opacity="0.7" />
        <line x1="50" y1="20" x2="32" y2="30" stroke="#38BDF8" strokeWidth="0.8" opacity="0.4" />
        <line x1="50" y1="20" x2="68" y2="30" stroke="#38BDF8" strokeWidth="0.8" opacity="0.4" />
        <line x1="32" y1="30" x2="68" y2="30" stroke="#38BDF8" strokeWidth="0.8" opacity="0.3" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-widest text-[#F8FAFC]"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.15em' }}
          >
            VISIGRITY
          </span>
          <span className="text-[10px] text-[#38BDF8] tracking-[0.2em] font-medium uppercase mt-0.5">
            Integrity Behind Every Vision
          </span>
        </div>
      )}
    </div>
  );
};
