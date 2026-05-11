export const audioPlayerPages = ['Home', 'Playlists'] as const;
export type AudioPlayerPage = (typeof audioPlayerPages)[number];

export type LoadedAudio = { windowId: string | null; file: File | null };

export type Playlist = { id: number; name: string; thumbnail?: File; audios: number[] };
