import { Composition } from "remotion";
import { Main } from "./Main";
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ReviewIQPromo"
      component={Main}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withAudio: true }}
    />
  );
};
