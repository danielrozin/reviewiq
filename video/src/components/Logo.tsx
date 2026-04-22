import { COLORS } from "../constants";

type Props = {
  size?: number;
  showText?: boolean;
  color?: string;
};

export const Logo: React.FC<Props> = ({
  size = 120,
  showText = true,
  color = COLORS.brand,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.2,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="8"
          y="8"
          width="104"
          height="104"
          rx="28"
          fill={color}
        />
        <path
          d="M42 58 L54 70 L80 44"
          stroke="#ffffff"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="60" r="46" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.3" fill="none" />
      </svg>
      {showText && (
        <span
          style={{
            fontSize: size * 0.55,
            fontWeight: 800,
            color: COLORS.text,
            letterSpacing: -size * 0.015,
          }}
        >
          Review<span style={{ color }}>IQ</span>
        </span>
      )}
    </div>
  );
};
