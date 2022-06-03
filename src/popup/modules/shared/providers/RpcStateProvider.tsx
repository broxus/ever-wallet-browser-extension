import { LoaderPage } from '@app/popup/components/LoaderPage';
import { ControllerState } from '@app/popup/utils';
import {
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '@app/shared';
import type nt from 'nekoton-wasm';
import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { useResolve } from '../hooks';
import { TokensStore } from '../store';
import { useRpc } from './RpcProvider';

export type ActiveTab =
  | nt.EnumItem<typeof ENVIRONMENT_TYPE_POPUP,
  {
    id?: number
    title?: string
    origin: string
    protocol?: string
    url?: string
  }>
  | nt.EnumItem<typeof ENVIRONMENT_TYPE_NOTIFICATION, undefined>
  | nt.EnumItem<typeof ENVIRONMENT_TYPE_FULLSCREEN,
  {
    route?: string
  }>
  | nt.EnumItem<typeof ENVIRONMENT_TYPE_BACKGROUND, undefined>;

type Props = {
  children: React.ReactNode
  group?: string
  activeTab: ActiveTab
};

type ContextConsumer = {
  activeTab?: ActiveTab
  group?: string
  loaded: boolean
  state: ControllerState
};

const Context = React.createContext<ContextConsumer>({
  activeTab: undefined,
  loaded: false,
  state: {} as ControllerState,
});

export function useRpcState() {
  return React.useContext(Context);
}

// TODO: store
export function RpcStateProvider({ children, group, activeTab }: Props): JSX.Element {
  const tokensStore = useResolve(TokensStore);
  const rpc = useRpc();

  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<ControllerState>({} as ControllerState);

  useEffect(() => {
    (async () => {
      const state = await rpc.getState();

      rpc.onNotification((data) => {
        const stateToUpdate = data.params;

        try {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Got state', stateToUpdate);
          }
          setState(stateToUpdate as ControllerState);
        } catch (e: any) {
          console.log(e.toString());
        }
      });

      // TODO: move to app or popup.tsx
      if (
        state.selectedAccount == null &&
        (activeTab.type === 'popup' || activeTab.type === 'notification')
      ) {
        await rpc.openExtensionInBrowser({});
        window.close();
      } else if (
        state.selectedAccount != null &&
        activeTab.type === 'fullscreen' &&
        activeTab.data.route == null
      ) {
        window.close();
      } else {
        setState(state);
      }

      setLoaded(true);

      await tokensStore.fetchManifest();
      // TODO: ^^^^^^^^^^^^^^^^^^^^^^^^
    })();
  }, []);

  if (!loaded) {
    return <LoaderPage />;
  }

  return (
    <Context.Provider value={{ group, activeTab, loaded, state }}>{children}</Context.Provider>
  );
}
