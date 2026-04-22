import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

const PROS = [
  "Handles pet hair on hardwood",
  "LiDAR mapping — no blind spots",
  "Self-empty dock included",
];
const CONS = [
  "Loud on highest setting",
  "Carpet transition hesitation",
];

export const Scene6SmartScore: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardAppear = spring({
    frame: frame - fps * 0.1,
    fps,
    config: { damping: 16, stiffness: 150 },
  });

  // Score counts from 0 to 92 over 1.5s
  const score = Math.floor(
    interpolate(frame, [fps * 0.6, fps * 2.4], [0, 92], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  // Progress ring fills with the score
  const circumference = 2 * Math.PI * 90;
  const progress = score / 100;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 1400,
          padding: 60,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 32,
          display: "flex",
          gap: 60,
          opacity: cardAppear,
          transform: `translateY(${(1 - cardAppear) * 40}px)`,
        }}
      >
        {/* Left: SmartScore ring */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative", width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r="90" stroke="rgba(255,255,255,0.1)" strokeWidth="16" fill="none" />
              <circle
                cx="110"
                cy="110"
                r="90"
                stroke={COLORS.brandLight}
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter",
              }}
            >
              <div style={{ fontSize: 88, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.textMuted, letterSpacing: 2 }}>
                SMARTSCORE
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontSize: 22,
              color: COLORS.textMuted,
              fontWeight: 500,
              letterSpacing: 1,
            }}
          >
            From 4,821 verified reviews
          </div>
        </div>

        {/* Right: pros/cons */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontFamily: "Inter", fontSize: 36, fontWeight: 800, color: COLORS.text }}>
            Roborock S8 Pro Ultra
          </div>
          <ProsConsList
            label="WHAT OWNERS LOVE"
            color={COLORS.success}
            items={PROS}
            startFrame={fps * 1.2}
            frame={frame}
            fps={fps}
          />
          <ProsConsList
            label="RECURRING ISSUES"
            color={COLORS.warning}
            items={CONS}
            startFrame={fps * 2.4}
            frame={frame}
            fps={fps}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProsConsList: React.FC<{
  label: string;
  color: string;
  items: string[];
  startFrame: number;
  frame: number;
  fps: number;
}> = ({ label, color, items, startFrame, frame, fps }) => {
  return (
    <div>
      <div
        style={{
          fontFamily: "Inter",
          fontSize: 18,
          fontWeight: 700,
          color,
          letterSpacing: 3,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {items.map((item, i) => {
        const appear = spring({
          frame: frame - startFrame - i * 6,
          fps,
          config: { damping: 18, stiffness: 200 },
        });
        return (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "8px 0",
              opacity: appear,
              transform: `translateX(${(1 - appear) * 20}px)`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <div style={{ fontFamily: "Inter", fontSize: 24, color: COLORS.text, fontWeight: 500 }}>
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};
