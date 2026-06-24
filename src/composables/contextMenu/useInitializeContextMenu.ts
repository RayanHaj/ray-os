import { useContextmenuStore } from '@/stores/contextMenu.ts';
import type {
  primaryActionsContextMenu,
  SecondaryActionsContextMenu,
} from '@/types/contextMenuTypes.ts';

export function useInitializeContextMenu(event: MouseEvent) {
  function createInitialize<
    PrimaryActions extends readonly (typeof primaryActionsContextMenu)[number][],
    SecondaryActions extends readonly SecondaryActionsContextMenu[],
  >(primaryActionsList: PrimaryActions, secondaryActionsList: SecondaryActions) {
    return (
      primaryActions: { [pAction in (typeof primaryActionsList)[number]]: () => void },
      secondaryActions: { [sAction in (typeof secondaryActionsList)[number]['id']]: () => void },
    ) => {
      const actions = { ...primaryActions, ...secondaryActions };

      useContextmenuStore().initializeContextMenu(
        primaryActionsList,
        secondaryActionsList,
        { left: event.clientX, top: event.clientY },
        actions,
      );

      useContextmenuStore().show();
    };
  }

  const desktop = () => {
    const primaryActions = [] as const;
    const secondaryActions = [] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const tile = () => {
    const primaryActions = ['Delete'] as const;
    const secondaryActions = [] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const fileExplorerGrid = () => {
    const primaryActions = ['Paste'] as const;
    const secondaryActions = [
      { id: 'newDirectory', label: 'new directory', disabled: false },
      { id: 'newTextFile', label: 'new text file', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const fileExplorerGridItem = (disableOptions?: {
    renameFile?: boolean;
    addToDesktop?: boolean;
    addToTaskbar?: boolean;
  }, labelOptions?: {
    addToTaskbar?: string;
  }) => {
    const primaryActions = ['Copy', 'Paste', 'Delete'] as const;
    const secondaryActions = [
      { id: 'renameFile', label: 'rename file', disabled: disableOptions?.renameFile ?? false },
      {
        id: 'addToDesktop',
        label: 'add to desktop',
        disabled: disableOptions?.addToDesktop ?? false,
      },
      {
        id: 'addToTaskbar',
        label: labelOptions?.addToTaskbar ?? 'add to taskbar',
        disabled: disableOptions?.addToTaskbar ?? false
      },
      { id: 'properties', label: 'open properties', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const audioPlayerPlaylist = () => {
    const primaryActions = [] as const;
    const secondaryActions = [
      { id: 'deletePlaylist', label: 'Delete playlist', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const audioPlayerAudio = () => {
    const primaryActions = [] as const;
    const secondaryActions = [
      { id: 'deleteAudio', label: 'Delete audio', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const taskbarTile = () => {
    const primaryActions = ['Delete'] as const;
    const secondaryActions = [] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  }

  return {
    desktop,
    tile,
    fileExplorerGrid,
    fileExplorerGridItem,
    audioPlayerPlaylist,
    audioPlayerAudio,
    taskbarTile,
  };
}
