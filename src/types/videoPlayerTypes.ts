export type LoadedVideo = { windowId: string | null; file: File | null };

export type Video = {
  videoFile: File | null;
  url: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  looped: boolean;
};

export const createVideo = (): Video => ({
  videoFile: null,
  url: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  looped: false,
});
