import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

type ICP = {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
};

const icons = {
  vacuum: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={COLORS.text} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill={COLORS.brandLight} />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  coffee: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h14v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" stroke={COLORS.text} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 10h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" stroke={COLORS.text} strokeWidth="2" />
      <path d="M8 3v3M12 3v3M16 3v3" stroke={COLORS.brandLight} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  home: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" stroke={COLORS.text} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.5" fill={COLORS.brandLight} />
    </svg>
  ),
  budget: (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke={COLORS.text} strokeWidth="2" />
      <circle cx="12" cy="12.5" r="3" stroke={COLORS.brandLight} strokeWidth="2" />
      <path d="M7 6V4M17 6V4" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const ICPS: ICP[] = [
  { icon: icons.vacuum, label: "Robot Vacuums", sublabel: "$100–$1,500" },
  { icon: icons.coffee, label: "Coffee Machines", sublabel: "$50–$2,000" },
  { icon: icons.home, label: "Any Home", sublabel: "Pets. Hardwood. Carpet." },
  { icon: icons.budget, label: "Any Budget", sublabel: "First-timer or pro." },
];

export const Scene7ICPs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerAppear = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        justifyContent: "center",
        alignItems: "center",
        gap: 80,
      }}
    >
      <div
        style={{
          fontFamily: "Inter",
          fontSize: 64,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: -2,
          opacity: headerAppear,
          transform: `translateY(${(1 - headerAppear) * 20}px)`,
          textAlign: "center",
        }}
      >
        Built for <span style={{ color: COLORS.brandLight }}>every buyer.</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 32,
          width: 1600,
        }}
      >
        {ICPS.map((icp, i) => {
          const appear = spring({
            frame: frame - fps * 0.5 - i * 5,
            fps,
            config: { damping: 14, stiffness: 180 },
          });
          return (
            <div
              key={icp.label}
              style={{
                padding: 40,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                opacity: appear,
                transform: `scale(${0.8 + appear * 0.2}) translateY(${(1 - appear) * 30}px)`,
              }}
            >
              {icp.icon}
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.text,
                  textAlign: "center",
                }}
              >
                {icp.label}
              </div>
              <div
                style={{
                  fontFamily: "Inter",
                  fontSize: 20,
                  fontWeight: 500,
                  color: COLORS.textMuted,
                  textAlign: "center",
                }}
              >
                {icp.sublabel}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
