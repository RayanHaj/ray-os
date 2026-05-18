import { useContextMenuStore } from '@/stores/contextMenu.ts';
import type {
  primaryActionsContextMenu,
  SecondaryActionsContextMenu,
} from '@/types/ContextMenuTypes.ts';

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

      useContextMenuStore().initializeContextMenu(
        primaryActionsList,
        secondaryActionsList,
        { left: event.clientX, top: event.clientY },
        actions,
      );

      useContextMenuStore().show();
    };
  }

  const desktop = () => {
    const primaryActions = ['Copy', 'Paste'] as const;
    const secondaryActions = [
      { id: 'properties', label: 'open properties', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const tile = () => {
    const primaryActions = ['Copy', 'Paste', 'Delete'] as const;
    const secondaryActions = [
      { id: 'properties', label: 'open properties', disabled: false },
    ] as const;

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
  const fileExplorerGridItem = () => {
    const primaryActions = ['Copy', 'Paste', 'Delete'] as const;
    const secondaryActions = [
      { id: 'renameFile', label: 'rename file', disabled: false },
      { id: 'addToDesktop', label: 'add to desktop', disabled: false },
    ] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };
  const audioPlayerListItem = () => {
    const primaryActions = ['Delete'] as const;
    const secondaryActions = [] as const;

    const initialize = createInitialize(primaryActions, secondaryActions);
    return { initialize };
  };

  return { desktop, tile, fileExplorerGrid, fileExplorerGridItem, audioPlayerListItem };
}
