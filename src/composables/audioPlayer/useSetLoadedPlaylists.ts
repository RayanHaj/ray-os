import type { Playlist } from '@/types/AudioPlayerTypes.ts';
import type { Ref } from 'vue';
import type { RayDb } from 'ray-db-wrapper';

export async function useSetLoadedPlaylists(
  rayDb: RayDb,
  loadedPlaylists: Ref<Playlist[]>,
  currentLoadedPlaylist: Ref<Playlist | undefined>,
) {
  currentLoadedPlaylist.value = undefined;

  const playlists = await rayDb.findAll<Playlist>('playlists');
  if (playlists.length === 0) return;

  loadedPlaylists.value = playlists;
}
