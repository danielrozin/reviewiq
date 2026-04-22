import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { COLORS } from "../constants";

export const Scene5Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoAppear = spring({
    frame: frame - fps * 0.2,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  const subtextOpacity = interpolate(frame, [fps * 1.2, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(frame, [0, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.brand}33 0%, transparent 60%)`,
          opacity: glowIntensity,
          filter: "blur(40px)",
        }}
      />

      <div
        style={{
          transform: `scale(${0.6 + logoAppear * 0.4})`,
          opacity: logoAppear,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Logo size={200} showText={true} />
      </div>

      <div
        style={{
          marginTop: 40,
          fontFamily: "Inter",
          fontSize: 34,
          fontWeight: 500,
          color: COLORS.textMuted,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: subtextOpacity,
        }}
      >
        AI-Powered Buyer Intelligence
      </div>
    </AbsoluteFill>
  );
};
