import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

export const Scene4Enough: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textAppear = spring({
    frame: frame - fps * 0.3,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Fade to pure black briefly, then text punches in
  const wordScale = interpolate(textAppear, [0, 1], [1.4, 1]);
  const wordOpacity = interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle exit zoom
  const exitScale = interpolate(frame, [fps * 2.4, fps * 3], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [fps * 2.4, fps * 3], [1, 0], {
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
      <div
        style={{
          fontFamily: "Inter",
          fontSize: 280,
          fontWeight: 900,
          color: COLORS.text,
          letterSpacing: -10,
          transform: `scale(${wordScale * exitScale})`,
          opacity: wordOpacity * exitOpacity,
        }}
      >
        Enough.
      </div>
    </AbsoluteFill>
  );
};
