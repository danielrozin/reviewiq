import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

export const Scene8NoAffiliate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stampAppear = spring({
    frame,
    fps,
    config: { damping: 7, stiffness: 200 },
  });
  const stampScale = interpolate(stampAppear, [0, 0.6, 1], [2.5, 0.9, 1]);
  const stampOpacity = interpolate(stampAppear, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          opacity: stampOpacity,
          transform: `scale(${stampScale}) rotate(-4deg)`,
        }}
      >
        <div
          style={{
            border: `10px solid ${COLORS.danger}`,
            padding: "24px 60px",
            fontFamily: "Inter",
            fontSize: 160,
            fontWeight: 900,
            color: COLORS.danger,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          0
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 48,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Affiliate Links
        </div>
        <div
          style={{
            fontFamily: "Inter",
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.textMuted,
            letterSpacing: 1,
          }}
        >
          No compromises. Ever.
        </div>
      </div>
    </AbsoluteFill>
  );
};
