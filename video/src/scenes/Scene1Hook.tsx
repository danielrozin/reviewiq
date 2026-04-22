import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

const SEARCH_QUERY = "best robot vacuum under $500";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typewriter effect over first 2s
  const typedChars = Math.floor(
    interpolate(frame, [fps * 0.4, fps * 2.2], [0, SEARCH_QUERY.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const typedText = SEARCH_QUERY.slice(0, typedChars);

  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  const fadeIn = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          width: 1100,
          padding: "32px 40px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontFamily: "Inter",
          fontSize: 44,
          color: COLORS.text,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={COLORS.textMuted} strokeWidth="2" />
          <path d="m21 21-4.3-4.3" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontWeight: 500 }}>
          {typedText}
          {cursorVisible && (
            <span style={{ color: COLORS.brandLight, marginLeft: 4 }}>|</span>
          )}
        </span>
      </div>
      <div
        style={{
          marginTop: 60,
          fontFamily: "Inter",
          fontSize: 32,
          fontWeight: 500,
          color: COLORS.textMuted,
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: interpolate(frame, [fps * 1.5, fps * 2.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Three hours of searching.
      </div>
    </AbsoluteFill>
  );
};
