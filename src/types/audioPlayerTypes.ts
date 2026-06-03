export type LoadedAudio = { windowId: string | null; file: File | null; fileId: number; playlistName: string; audioUrl?: string; isPlaying?: boolean };

export type PlaylistInsert = { name: string; audios: number[] };
export type Playlist = { id: number; name: string; audios: number[] };

export type AudioPlayerPages = 'playlists' | 'playlist';
