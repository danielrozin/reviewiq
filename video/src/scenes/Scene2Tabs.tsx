import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

const TAB_COUNT = 47;

export const Scene2Tabs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const visibleTabs = Math.floor(
    interpolate(frame, [0, fps * 1.2], [0, TAB_COUNT], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const counter = Math.floor(
    interpolate(frame, [fps * 0.2, fps * 1.4], [0, TAB_COUNT], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const counterScale = spring({
    frame: frame - fps * 1.2,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Browser chrome with tabs */}
      <div
        style={{
          width: 1700,
          height: 80,
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          padding: "0 20px",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: visibleTabs }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 34,
              height: 56,
              background: i === visibleTabs - 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
              borderRadius: "8px 8px 0 0",
              borderTop: "2px solid " + (i === visibleTabs - 1 ? COLORS.brandLight : "transparent"),
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Big counter */}
      <div
        style={{
          marginTop: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${0.85 + counterScale * 0.15})`,
        }}
      >
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 280,
            fontWeight: 900,
            color: COLORS.text,
            letterSpacing: -8,
            lineHeight: 1,
          }}
        >
          {counter}
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 36,
            fontWeight: 500,
            color: COLORS.textMuted,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginTop: 20,
          }}
        >
          Tabs open
        </div>
      </div>
    </AbsoluteFill>
  );
};
