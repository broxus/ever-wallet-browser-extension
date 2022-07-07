import { useResolve } from '@app/popup/modules/shared';
import { runInAction } from 'mobx';
import { DependencyList, useEffect, useMemo, useRef } from 'react';
import { InjectionToken } from 'tsyringe';
import Disposable from 'tsyringe/dist/typings/types/disposable';

export function useViewModel<T>(token: InjectionToken<T>, apply?: (vm: T) => void, deps?: DependencyList): T {
  const instance = useResolve(token);
  const vm = useMemo(() => {
    apply?.(instance);
    return instance;
  }, []);

  if (apply && deps) {
    const initializedRef = useRef(false);

    useEffect(() => {
      if (initializedRef.current) {
        runInAction(() => apply(vm));
      }
      initializedRef.current = true;
    }, deps);
  }

  useEffect(() => () => {
    if (isDisposable(vm)) {
      vm.dispose();
    }
  }, []);

  return vm;
}

function isDisposable(value: any): value is Disposable {
  return 'dispose' in value && typeof value.dispose === 'function';
}
