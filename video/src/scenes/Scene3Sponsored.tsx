import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";

const FAKE_SITES = [
  "TopPicks.io",
  "ReviewHub",
  "BestGearDaily",
  "GadgetGuide Pro",
  "VacuumAdvisor",
  "BuyerBeacon",
];

export const Scene3Sponsored: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgDeep,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: 1200,
        }}
      >
        {FAKE_SITES.map((site, i) => {
          const rowAppear = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 18, stiffness: 180 },
          });

          // SPONSORED stamp appears after all rows have appeared
          const stampAppear = spring({
            frame: frame - fps * 2 - i * 4,
            fps,
            config: { damping: 8, stiffness: 220 },
          });
          const stampOpacity = interpolate(stampAppear, [0, 0.5, 1], [0, 1.3, 1]);

          return (
            <div
              key={site}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 32px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                opacity: rowAppear,
                transform: `translateX(${(1 - rowAppear) * -60}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #334155, #1e293b)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter",
                    fontWeight: 800,
                    color: COLORS.textMuted,
                    fontSize: 22,
                  }}
                >
                  {site[0]}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontSize: 32,
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {site}
                </div>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontSize: 20,
                    color: COLORS.textMuted,
                    marginLeft: 12,
                  }}
                >
                  "Our #1 pick: Roborock S8"
                </div>
              </div>
              <div
                style={{
                  padding: "8px 18px",
                  background: COLORS.danger,
                  color: "#fff",
                  fontFamily: "Inter",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: 2,
                  borderRadius: 6,
                  textTransform: "uppercase",
                  opacity: Math.max(0, Math.min(1, stampOpacity)),
                  transform: `scale(${0.5 + Math.max(0, Math.min(1.2, stampAppear)) * 0.5}) rotate(-8deg)`,
                }}
              >
                Sponsored
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
