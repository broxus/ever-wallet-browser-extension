import React, { useMemo, useState } from 'react';

export enum Panel {
  RECEIVE,
  SEND,
  DEPLOY,
  CREATE_ACCOUNT,
  MANAGE_SEEDS,
  ASSET,
  TRANSACTION,
}

type Props = React.PropsWithChildren<{}>;

export interface DrawerContext {
  currentPanel: Panel | undefined;
  setPanel: React.Dispatch<React.SetStateAction<Panel | undefined>>;
}

const Context = React.createContext<DrawerContext>({
  currentPanel: undefined,
  setPanel() {
  },
});

export function useDrawerPanel() {
  return React.useContext(Context);
}

export function DrawerPanelProvider({ children }: Props): JSX.Element {
  const [currentPanel, setPanel] = useState<Panel>();
  const value = useMemo(() => ({
    currentPanel,
    setPanel,
  }), [currentPanel]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
