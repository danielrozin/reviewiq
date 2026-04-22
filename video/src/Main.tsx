import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { COLORS, SCENE_DURATIONS_FRAMES } from "./constants";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Tabs } from "./scenes/Scene2Tabs";
import { Scene3Sponsored } from "./scenes/Scene3Sponsored";
import { Scene4Enough } from "./scenes/Scene4Enough";
import { Scene5Logo } from "./scenes/Scene5Logo";
import { Scene6SmartScore } from "./scenes/Scene6SmartScore";
import { Scene7ICPs } from "./scenes/Scene7ICPs";
import { Scene8NoAffiliate } from "./scenes/Scene8NoAffiliate";
import { Scene9CTA } from "./scenes/Scene9CTA";

loadFont("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

type Props = {
  withAudio?: boolean;
};

export const Main: React.FC<Props> = ({ withAudio = true }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      {withAudio && <Audio src={staticFile("voiceover.mp3")} />}
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.hook}>
          <Scene1Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.tabs}>
          <Scene2Tabs />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.sponsored}>
          <Scene3Sponsored />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.enough}>
          <Scene4Enough />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.logo}>
          <Scene5Logo />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.smartScore}>
          <Scene6SmartScore />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.icps}>
          <Scene7ICPs />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.noAffiliate}>
          <Scene8NoAffiliate />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS_FRAMES.cta}>
          <Scene9CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
