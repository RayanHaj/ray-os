import type { Playlist } from '@/types/AudioPlayerTypes.ts';
import type { Ref } from 'vue';

export function useGetLoadedPlaylistById(
  loadedPlaylists: Ref<Playlist[]>,
  id: number,
): Playlist | undefined {
  return loadedPlaylists.value.find((playlist) => playlist.id === id);
}
