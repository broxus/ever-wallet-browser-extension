import { en, ko } from '@app/lang';
import { NekotonRpcError, RpcErrorCode } from '@app/models';
import browser from 'webextension-polyfill';
import { BaseConfig, BaseController, BaseState } from './BaseController';

type LocalizationKeys = { [T in keyof typeof en]: string };

const DEFAULT_LOCALE: string = 'en';

export interface LocalizationControllerConfig extends BaseConfig {
}

export interface LocalizationControllerState extends BaseState {
  defaultLocale: string;
  selectedLocale?: string | undefined;
}

function makeDefaultState(): LocalizationControllerState {
  return {
    defaultLocale: DEFAULT_LOCALE,
    selectedLocale: undefined,
  };
}

export class LocalizationController extends BaseController<LocalizationControllerConfig,
LocalizationControllerState> {
  private readonly _locales: { [key: string]: LocalizationKeys } = { en, ko };

  constructor(config: LocalizationControllerConfig, state?: LocalizationControllerState) {
    super(config, state || makeDefaultState());

    this.initialize();
  }

  public async initialSync() {
    const selectedLocale = await LocalizationController._loadSelectedLocale();
    this.update({ defaultLocale: DEFAULT_LOCALE, selectedLocale });
  }

  public async setLocale(locale: string) {
    if (this._locales[locale] == null) {
      throw new NekotonRpcError(
        RpcErrorCode.RESOURCE_UNAVAILABLE,
        `Locale "${locale}" is not supported.`,
      );
    }

    await LocalizationController._saveSelectedLocale(locale);
    this.update({ selectedLocale: locale });
  }

  public localize(
    key: keyof LocalizationKeys,
    params: Record<string, string | number> = {},
  ): string {
    return this._locales[this.state.selectedLocale || DEFAULT_LOCALE][key].replace(
      /{([^}]+)}/g,
      (_, paramName) => (params[paramName] || '').toString(),
    );
  }

  private static async _loadSelectedLocale(): Promise<string | undefined> {
    const { selectedLocale } = await browser.storage.local.get(['selectedLocale']);
    if (typeof selectedLocale === 'string') {
      return selectedLocale;
    }
    return undefined;
  }

  private static async _saveSelectedLocale(locale: string): Promise<void> {
    await browser.storage.local.set({ selectedLocale: locale });
  }
}
