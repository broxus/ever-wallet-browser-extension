import { en, ko } from '@app/lang';
import { Logger } from '@app/shared';
import { computed, makeObservable } from 'mobx';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import { singleton } from 'tsyringe';
import { RpcStore } from './RpcStore';

@singleton()
export class LocalizationStore {
  private cache = createIntlCache();
  private current: IntlShape | undefined;

  constructor(
    private rpcStore: RpcStore,
    private logger: Logger,
  ) {
    makeObservable(this, {
      locale: computed,
      intl: computed,
    });
  }

  get locale(): string {
    return this.rpcStore.state.selectedLocale || this.rpcStore.state.defaultLocale;
  }

  get intl(): IntlShape {
    if (!this.current || this.current.locale !== this.locale) {
      this.current = createIntl({
        locale: this.locale,
        defaultLocale: this.rpcStore.state.defaultLocale,
        messages: ({ en, ko } as { [key: string]: Record<string, string> })[this.locale],
        onError: (error) => this.logger.error(error),
      }, this.cache);
    }

    return this.current!;
  }

  setLocale = async (locale: string) => {
    try {
      await this.rpcStore.rpc.setLocale(locale);
    } catch (e) {
      this.logger.error(e);
    }
  };
}
