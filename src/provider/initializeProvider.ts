import { ConsoleLike } from '@app/shared';
import { Duplex } from 'readable-stream';
import { NekotonInpageProvider } from './NekotonInpageProvider';

type InitializeProviderOptions<T extends Duplex> = {
  connectionStream: T
  jsonRpcStreamName?: string
  logger?: ConsoleLike
  maxEventListeners?: number
  shouldSetOnWindow?: boolean
};

function setGlobalProvider<S extends Duplex>(
  providerInstance: NekotonInpageProvider<S>,
): void {
  (window as any).__ever = providerInstance;
  window.dispatchEvent(new Event('ever#initialized'));

  // TODO: remove later
  (window as any).ton = providerInstance;
  window.dispatchEvent(new Event('ton#initialized'));
}

export const initializeProvider = <S extends Duplex>({
  connectionStream,
  jsonRpcStreamName,
  logger = console,
  maxEventListeners = 100,
  shouldSetOnWindow = true,
}: InitializeProviderOptions<S>) => {
  const provider = new NekotonInpageProvider(connectionStream, {
    jsonRpcStreamName,
    logger,
    maxEventListeners,
  });

  if (shouldSetOnWindow) {
    setGlobalProvider(provider);
  }

  return provider;
};
