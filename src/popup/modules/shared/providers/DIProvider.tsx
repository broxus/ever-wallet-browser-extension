import React, { createContext, useContext } from 'react';
import { DependencyContainer } from 'tsyringe';

const Context = createContext<DependencyContainer>(null!);
export const useDI = () => useContext(Context);
export const DIProvider = Context.Provider;
