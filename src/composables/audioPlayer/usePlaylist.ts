import type {
  AudioPlayerPages,
  LoadedAudio,
  Playlist,
  PlaylistInsert,
} from '@/types/audioPlayerTypes.ts';
import { isAudioType, type Item } from '@/types/itemTypes.ts';
import type { Ref } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useToastStore } from '@/stores/toast.ts';
import { usePlayAudio } from '@/composables/audioPlayer/useAudioPlayback.ts';
import { useGetLoadedAudioByAudioUrl } from '@/composables/audioPlayer/useGetLoadedAudioByAudioUrl.ts';

export async function useSavePlaylist(
  updatedPlaylistName: string,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedPlaylist: Playlist | undefined,
  windowId: string,
  rayDb: RayDb,
) {
  try {
    const trimmedPlaylistName = updatedPlaylistName.trim();
    if (!updatedPlaylistName || trimmedPlaylistName === '') {
      useToastStore().createToast('enter a playlist name', 'warning', 2500, 'window', windowId);
      return;
    }

    const IDBAudioIds = loadedAudios.value.map((loadedAudios) => loadedAudios.fileId);

    if (!currentLoadedPlaylist) {
      const playlistInsert: PlaylistInsert = { name: trimmedPlaylistName, audios: IDBAudioIds };
      await rayDb.insertOne('playlists', playlistInsert);
      useToastStore().createToast(
        'Playlist saved successfully',
        'success',
        1000,
        'window',
        windowId,
      );
      return;
    }

    currentLoadedPlaylist.name = trimmedPlaylistName;
    currentLoadedPlaylist.audios = IDBAudioIds;

    const foundPlaylist = await rayDb.findOne<Playlist>(
      'playlists',
      'id',
      currentLoadedPlaylist.id,
    );
    const updatedPlaylist = { ...currentLoadedPlaylist, audios: [...currentLoadedPlaylist.audios] };

    if (JSON.stringify(foundPlaylist) === JSON.stringify(updatedPlaylist)) {
      useToastStore().createToast('No changes made', 'warning', 2500, 'window', windowId);
      return;
    }

    await rayDb.updateOne<Playlist>('playlists', updatedPlaylist);

    useToastStore().createToast('Playlist saved successfully', 'success', 2500, 'window', windowId);
  } catch (e) {
    console.error(e);
    useToastStore().createToast(
      'Could not save playlist, try again',
      'error',
      5000,
      'window',
      windowId,
    );
  }
}

export async function useOpenPlaylist(
  playlist: Playlist,
  currentLoadedPlaylistId: Ref<number | undefined>,
  currentPage: Ref<AudioPlayerPages>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudioUrl: Ref<string | undefined>,
  audioObject: Ref<HTMLAudioElement | null>,
  windowId: string,
  rayDb: RayDb,
  playPlaylist: boolean = true,
) {
  const foundLoadedAudios: LoadedAudio[] = [];
  if (playlist.audios.length > 0) {
    const currentLoadedAudio = useGetLoadedAudioByAudioUrl(
      loadedAudios,
      currentLoadedAudioUrl.value,
    );

    for (const fileId of playlist.audios) {
      const audio = await rayDb.findOne<Item>('files', 'id', fileId);
      if (!audio || audio.content.type !== 'file') continue;
      if (!isAudioType(audio.content.rawFile?.type)) continue;

      const audioUrl =
        currentLoadedAudio?.fileId === fileId
          ? currentLoadedAudioUrl.value
          : URL.createObjectURL(audio.content.rawFile);

      foundLoadedAudios.push({
        windowId: windowId,
        file: audio.content.rawFile,
        audioUrl: audioUrl,
        fileId: audio.id,
        isPlaying: currentLoadedAudioUrl.value === audioUrl,
        playlistName: playlist.name,
      });
    }

    loadedAudios.value = foundLoadedAudios;

    if (!currentLoadedAudioUrl.value) {
      currentLoadedAudioUrl.value = foundLoadedAudios[0].audioUrl;
    }
  }

  currentLoadedPlaylistId.value = playlist.id;
  currentPage.value = 'playlist';

  if (playPlaylist) {
    if (audioObject.value?.src) {
      return;
    }

    await usePlayAudio(audioObject, loadedAudios, currentLoadedAudioUrl);
  }
}

export async function useDeletePlaylist(
  playlistId: number,
  loadedPlaylists: Ref<Playlist[]>,
  currentLoadedPlaylistId: Ref<number | undefined>,
  rayDb: RayDb,
  windowId: string,
) {
  try {
    await rayDb.deleteOne('playlists', playlistId);
    loadedPlaylists.value = loadedPlaylists.value.filter((playlist) => playlist.id !== playlistId);
    if (currentLoadedPlaylistId.value !== playlistId) return;
    currentLoadedPlaylistId.value = undefined;
  } catch (e) {
    console.error(e);
    useToastStore().createToast(
      'Could not delete playlist, try again',
      'error',
      5000,
      'window',
      windowId,
    );
  }
}
