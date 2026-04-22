import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { COLORS } from "../constants";

export const Scene9CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoAppear = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const taglineOpacity = interpolate(frame, [fps * 0.4, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const urlAppear = spring({
    frame: frame - fps * 0.8,
    fps,
    config: { damping: 16, stiffness: 180 },
  });

  const glow = interpolate(frame, [0, fps * 1], [0, 1], {
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
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.brand}44 0%, transparent 55%)`,
          opacity: glow,
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          zIndex: 1,
        }}
      >
        <div style={{ transform: `scale(${0.7 + logoAppear * 0.3})`, opacity: logoAppear }}>
          <Logo size={160} showText={true} />
        </div>

        <div
          style={{
            fontFamily: "Inter",
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.text,
            letterSpacing: -1,
            opacity: taglineOpacity,
            textAlign: "center",
            maxWidth: 1200,
          }}
        >
          The only review that matters —{" "}
          <span style={{ color: COLORS.brandLight }}>yours.</span>
        </div>

        <div
          style={{
            padding: "20px 48px",
            background: COLORS.brand,
            borderRadius: 999,
            fontFamily: "Inter",
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.text,
            letterSpacing: 1,
            opacity: urlAppear,
            transform: `scale(${0.85 + urlAppear * 0.15})`,
            boxShadow: `0 20px 60px ${COLORS.brand}66`,
          }}
        >
          revieweriq.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
