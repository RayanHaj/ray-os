import type {
  AudioPlayerPages,
  LoadedAudio,
  Playlist,
  PlaylistInsert,
} from '@/types/AudioPlayerTypes.ts';
import { isAudioType, type Item } from '@/types/ItemTypes.ts';
import type { Ref } from 'vue';
import type { RayDb } from 'ray-db-wrapper';
import { useToastStore } from '@/stores/toast.ts';
import { usePlayAudio } from '@/composables/audioPlayer/useAudioPlayback.ts';

export async function useSavePlaylist(
  updatedPlaylistName: string,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedPlaylist: Ref<Playlist | undefined>,
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

    if (!currentLoadedPlaylist.value) {
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

    currentLoadedPlaylist.value.name = trimmedPlaylistName;
    currentLoadedPlaylist.value.audios = IDBAudioIds;

    const foundPlaylist = await rayDb.findOne<Playlist>(
      'playlists',
      'id',
      currentLoadedPlaylist.value.id,
    );
    const updatedPlaylist = {
      ...currentLoadedPlaylist.value,
      audios: [...currentLoadedPlaylist.value.audios],
    };

    if (JSON.stringify(foundPlaylist) === JSON.stringify(updatedPlaylist)) {
      useToastStore().createToast('No changes made', 'warning', 2500, 'window', windowId);
      return;
    }

    await rayDb.updateOne<Playlist>('playlists', updatedPlaylist);

    useToastStore().createToast('Playlist saved successfully', 'success', 2500, 'window', windowId);
  } catch (e) {
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
  currentLoadedPlaylist: Ref<Playlist | undefined>,
  currentPage: Ref<AudioPlayerPages>,
  loadedAudios: Ref<LoadedAudio[]>,
  currentLoadedAudio: Ref<LoadedAudio | undefined>,
  audioObject: Ref<HTMLAudioElement | null>,
  windowId: string,
  rayDb: RayDb,
  playPlaylist: boolean = true,
) {
  const foundLoadedAudios: LoadedAudio[] = [];
  if (playlist.audios.length > 0) {
    for (const fileId of playlist.audios) {
      const audio = await rayDb.findOne<Item>('files', 'id', fileId);
      if (!audio || audio.content.type !== 'file') continue;
      if (!isAudioType(audio.content.rawFile?.type)) continue;

      const audioUrl =
        currentLoadedAudio.value &&
        currentLoadedAudio.value.isPlaying &&
        currentLoadedAudio.value.fileId === fileId &&
        currentLoadedAudio.value.playlistName === playlist.name
          ? currentLoadedAudio.value.audioUrl
          : URL.createObjectURL(audio.content.rawFile);

      foundLoadedAudios.push({
        windowId: windowId,
        file: audio.content.rawFile,
        audioUrl: audioUrl,
        fileId: audio.id,
        isPlaying:
          currentLoadedAudio.value &&
          currentLoadedAudio.value.isPlaying &&
          currentLoadedAudio.value.audioUrl === audioUrl,
        playlistName: playlist.name,
      });
    }

    loadedAudios.value = foundLoadedAudios;

    if (!currentLoadedAudio.value) {
      currentLoadedAudio.value = foundLoadedAudios[0];
    }
  }

  currentLoadedPlaylist.value = playlist;
  currentPage.value = 'playlist';

  if (playPlaylist) {
    if (audioObject.value?.src) {
      return;
    }

    await usePlayAudio(
      audioObject,
      loadedAudios,
      currentLoadedAudio,
      currentLoadedAudio.value?.audioUrl,
    );
  }
}

export async function useDeletePlaylist(
  playlistId: number,
  loadedPlaylists: Ref<Playlist[]>,
  currentLoadedPlaylist: Ref<Playlist | undefined>,
  rayDb: RayDb,
  windowId: string,
) {
  try {
    await rayDb.deleteOne('playlists', playlistId);
    loadedPlaylists.value = loadedPlaylists.value.filter((playlist) => playlist.id !== playlistId);
    if (currentLoadedPlaylist.value?.id !== playlistId) return;
    currentLoadedPlaylist.value = undefined;
  } catch (e) {
    useToastStore().createToast(
      'Could not delete playlist, try again',
      'error',
      5000,
      'window',
      windowId,
    );
  }
}
