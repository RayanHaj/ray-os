export type LoadedAudio = { windowId: string | null; file: File | null; audioUrl?: string; isPlaying?: boolean };
export type Playlist = { id: number; name: string; thumbnail?: File; audios: number[] };
