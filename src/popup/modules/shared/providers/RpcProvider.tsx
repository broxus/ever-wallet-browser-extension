import { ControllerRpcClientToken, useResolve } from '@app/popup/modules/shared';
import { IControllerRpcClient } from '@app/popup/utils';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Context = React.createContext<IControllerRpcClient>({} as IControllerRpcClient);

export function useRpc() {
  return React.useContext(Context);
}

// TODO: refactor
export function RpcProvider({ children }: Props): JSX.Element {
  const rpc = useResolve(ControllerRpcClientToken);

  return (
    <Context.Provider value={rpc}>
      {children}
    </Context.Provider>
  );
}
