export const audioPlayerPages = ['Home', 'Playlists'] as const;
export type AudioPlayerPage = (typeof audioPlayerPages)[number];

export type Playlist = { id: number; name: string; thumbnail?: File; audios: number[] };
